import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe webhook receiver.
 *
 * Security: every request is verified against STRIPE_WEBHOOK_SECRET before
 * anything is read or stored. Unsigned/invalid/replayed requests get 400/401
 * and write nothing. If the secret isn't configured the endpoint returns 503.
 *
 * On a verified event it updates billing state so access unlocks:
 *   - checkout.session.completed → activate a subscription (or record a
 *     one-time purchase) and mark the checkout_sessions row completed.
 *   - customer.subscription.updated/deleted → sync status + period dates.
 * Access itself is computed by has_access() from active subscriptions /
 * paid purchases, so activating the row here is what grants access.
 *
 * Secrets are read per-request from Lovable Cloud secrets, never hard-coded:
 *   - STRIPE_WEBHOOK_SECRET  (required to activate this endpoint)
 */

/** Constant-time-ish comparison of two hex strings. */
function hexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify a Stripe `stripe-signature` header against the raw body using the
 * webhook signing secret. Stripe v1 scheme (HMAC-SHA256 over `${t}.${payload}`)
 * with a 5-minute timestamp tolerance to block replays.
 */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!sigHeader) return false;
  const fields: Record<string, string> = {};
  for (const part of sigHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx > 0) fields[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  const t = fields["t"];
  const v1 = fields["v1"];
  if (!t || !v1) return false;

  const ts = Number.parseInt(t, 10);
  if (!Number.isFinite(ts)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - ts) > 300) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexEqual(expected, v1);
}

const VALID_SUB_STATUSES = new Set([
  "active", "trialing", "past_due", "canceled",
  "incomplete", "incomplete_expired", "unpaid", "paused",
]);

function toIso(unixSeconds: unknown): string | null {
  const n = Number(unixSeconds);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString() : null;
}

type Admin = { from: (t: string) => any };

/** Apply a verified event to billing tables. Returns true if handled. */
async function processStripeEvent(
  admin: Admin,
  type: string,
  event: Record<string, any>,
): Promise<boolean> {
  const obj = (event?.data?.object ?? {}) as Record<string, any>;

  if (type === "checkout.session.completed") {
    const meta = (obj.metadata ?? {}) as Record<string, string>;
    const userId = meta.user_id ?? null;
    const planId = meta.plan_id ?? null;
    const csId = meta.checkout_session_id ?? obj.client_reference_id ?? null;

    if (csId) {
      await admin.from("checkout_sessions").update({ status: "completed" }).eq("id", csId);
    }
    if (!userId) return true;

    if (obj.mode === "subscription" && obj.subscription) {
      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: planId,
          stripe_customer_id: obj.customer ?? null,
          stripe_subscription_id: obj.subscription,
          status: "active",
        },
        { onConflict: "stripe_subscription_id" },
      );
    } else if (obj.mode === "payment") {
      await admin.from("purchases").insert({
        user_id: userId,
        plan_id: planId,
        purchase_type: "one_time",
        amount: (Number(obj.amount_total) || 0) / 100,
        currency: String(obj.currency ?? "usd").toUpperCase(),
        stripe_payment_intent_id: obj.payment_intent ?? null,
        status: "paid",
      });
    }
    return true;
  }

  if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const status = VALID_SUB_STATUSES.has(obj.status) ? obj.status : "canceled";
    await admin
      .from("subscriptions")
      .update({
        status,
        current_period_start: toIso(obj.current_period_start),
        current_period_end: toIso(obj.current_period_end),
        cancel_at_period_end: !!obj.cancel_at_period_end,
        trial_end: toIso(obj.trial_end),
      })
      .eq("stripe_subscription_id", obj.id);
    return true;
  }

  // Other event types are recorded for audit but need no action here.
  return false;
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          return new Response(JSON.stringify({ error: "Webhook not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const bodyText = await request.text();
        const stripeSignature = request.headers.get("stripe-signature");

        const valid = await verifyStripeSignature(bodyText, stripeSignature, webhookSecret);
        if (!valid) {
          return new Response(JSON.stringify({ error: "Signature verification failed" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let payload: Record<string, unknown> = {};
        let eventType = "unknown";
        let stripeEventId: string | null = null;
        try {
          payload = JSON.parse(bodyText) as Record<string, unknown>;
          eventType = (payload?.type as string) ?? "unknown";
          stripeEventId = (payload?.id as string) ?? null;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as Admin;

        let processed = false;
        let processingError: string | null = null;
        try {
          processed = await processStripeEvent(admin, eventType, payload);
        } catch (e) {
          processingError = e instanceof Error ? e.message : String(e);
          console.error("[webhook] processing error", eventType, processingError);
        }

        try {
          await admin.from("payment_webhook_events").insert({
            stripe_event_id: stripeEventId,
            event_type: eventType,
            payload_json: payload,
            processed,
            processing_error: processingError,
          });
        } catch {
          // Already acted; don't fail the ack or Stripe will retry the mutation.
          console.error("[webhook] failed to record event", stripeEventId);
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
