import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe webhook receiver.
 *
 * Security: every request is verified against STRIPE_WEBHOOK_SECRET before
 * anything is stored. Unsigned or invalid requests get 400/401 and are NOT
 * written to the database — this endpoint is public, so it must never persist
 * attacker-supplied data. If the secret isn't configured yet, the endpoint is
 * considered inactive and returns 503 (still storing nothing).
 *
 * Event *processing* (subscription/invoice/purchase mutations) is a later
 * phase; for now verified events are recorded in `payment_webhook_events` for
 * admin inspection.
 *
 * Secrets are read per-request from Lovable Cloud secrets, never hard-coded:
 *   - STRIPE_WEBHOOK_SECRET  (required to activate this endpoint)
 *   - STRIPE_SECRET_KEY      (used by the later checkout/processing phase)
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
 * webhook signing secret. Implements Stripe's v1 scheme (HMAC-SHA256 over
 * `${t}.${payload}`) with a 5-minute timestamp tolerance to block replays.
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
  if (Math.abs(nowSec - ts) > 300) return false; // replay window

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

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        // Not activated yet — reject without touching the database.
        if (!webhookSecret) {
          return new Response(
            JSON.stringify({ error: "Webhook not configured" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }

        const bodyText = await request.text();
        const stripeSignature = request.headers.get("stripe-signature");

        const valid = await verifyStripeSignature(bodyText, stripeSignature, webhookSecret);
        if (!valid) {
          // Invalid/forged/replayed — store nothing, return 400.
          return new Response(
            JSON.stringify({ error: "Signature verification failed" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
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

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("payment_webhook_events").insert({
            stripe_event_id: stripeEventId,
            event_type: eventType,
            payload_json: payload,
            processed: false,
            processing_error: "Verified — event processing not yet activated.",
          });
        } catch {
          return new Response("Storage error", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
