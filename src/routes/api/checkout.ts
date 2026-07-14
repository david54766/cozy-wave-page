import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side Stripe Checkout Session creation.
 *
 * Called by the web app's startCheckout() with the member's Supabase access
 * token. Creates a real Stripe Checkout Session (subscription for monthly/
 * annual plans, one-time payment otherwise) and returns its hosted URL.
 *
 * Secrets are read per-request from env (Lovable Cloud secrets), never
 * hard-coded:
 *   - STRIPE_SECRET_KEY  (required — endpoint returns 503 without it)
 * The Stripe REST API is called via fetch so it works on the Cloudflare
 * Workers runtime (the Stripe Node SDK is not Workers-friendly).
 *
 * NOTE: purchase UI is hidden in the native app (App Store / Play policy), so
 * this endpoint is only exercised from the website.
 */

const STRIPE_API = "https://api.stripe.com/v1";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Flatten a params object into application/x-www-form-urlencoded for Stripe. */
function formEncode(obj: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "") p.append(k, String(v));
  }
  return p.toString();
}

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY;
        if (!secret) return json({ error: "Payments not configured" }, 503);

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return json({ error: "Unauthorized" }, 401);

        let payload: { checkoutSessionId?: string };
        try {
          payload = (await request.json()) as { checkoutSessionId?: string };
        } catch {
          return json({ error: "Invalid request body" }, 400);
        }
        const checkoutSessionId = payload.checkoutSessionId;
        if (!checkoutSessionId) return json({ error: "Missing checkoutSessionId" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Authenticate the caller from their Supabase JWT.
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
        const user = userData.user;

        // The checkout_sessions row was created client-side by startCheckout and
        // must belong to this user.
        const admin = supabaseAdmin as unknown as {
          from: (t: string) => any;
        };
        const { data: cs } = await admin
          .from("checkout_sessions")
          .select("id,user_id,plan_id")
          .eq("id", checkoutSessionId)
          .maybeSingle();
        if (!cs || cs.user_id !== user.id) return json({ error: "Not found" }, 404);
        if (!cs.plan_id) return json({ error: "Checkout has no plan" }, 400);

        const { data: plan } = await admin
          .from("plans")
          .select("*")
          .eq("id", cs.plan_id)
          .maybeSingle();
        if (!plan) return json({ error: "Plan not found" }, 404);

        const isSubscription =
          plan.billing_interval === "monthly" || plan.billing_interval === "annual";
        const interval = plan.billing_interval === "annual" ? "year" : "month";
        const origin = request.headers.get("origin") || "https://joinagalink.com";

        const params: Record<string, string | number | undefined> = {
          mode: isSubscription ? "subscription" : "payment",
          success_url: `${origin}/checkout/success?session=${cs.id}`,
          cancel_url: `${origin}/checkout/failed`,
          client_reference_id: cs.id,
          customer_email: user.email ?? undefined,
          "line_items[0][quantity]": 1,
          "metadata[user_id]": user.id,
          "metadata[plan_id]": plan.id,
          "metadata[checkout_session_id]": cs.id,
        };

        if (plan.stripe_price_id) {
          // Use a pre-created Stripe Price if the plan has one.
          params["line_items[0][price]"] = plan.stripe_price_id;
        } else {
          // Otherwise build the price inline from the plan record.
          params["line_items[0][price_data][currency]"] = (plan.currency || "usd").toLowerCase();
          params["line_items[0][price_data][product_data][name]"] = plan.name;
          params["line_items[0][price_data][unit_amount]"] = Math.round(Number(plan.price) * 100);
          if (isSubscription) {
            params["line_items[0][price_data][recurring][interval]"] = interval;
          }
        }

        if (isSubscription) {
          params["subscription_data[metadata][user_id]"] = user.id;
          params["subscription_data[metadata][plan_id]"] = plan.id;
          if (plan.trial_days && Number(plan.trial_days) > 0) {
            params["subscription_data[trial_period_days]"] = Number(plan.trial_days);
          }
        } else {
          params["payment_intent_data[metadata][user_id]"] = user.id;
          params["payment_intent_data[metadata][plan_id]"] = plan.id;
        }

        let session: { id?: string; url?: string; error?: unknown };
        try {
          const resp = await fetch(`${STRIPE_API}/checkout/sessions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formEncode(params),
          });
          session = (await resp.json()) as { id?: string; url?: string; error?: unknown };
          if (!resp.ok || !session.url) {
            console.error("[checkout] Stripe error", session?.error ?? session);
            return json({ error: "Could not create checkout session" }, 502);
          }
        } catch (e) {
          console.error("[checkout] request failed", e);
          return json({ error: "Checkout request failed" }, 502);
        }

        await admin
          .from("checkout_sessions")
          .update({
            stripe_session_id: session.id,
            checkout_url: session.url,
            status: "pending",
          })
          .eq("id", cs.id);

        return json({ url: session.url });
      },
    },
  },
});
