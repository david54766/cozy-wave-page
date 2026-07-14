import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe Billing Portal session creation.
 *
 * Returns a hosted Stripe Customer Portal URL where a member can update their
 * card, change plan, download invoices, and cancel. Authenticates via the
 * member's Supabase JWT, looks up their stripe_customer_id, and creates a
 * portal session. Reads STRIPE_SECRET_KEY from env (never hard-coded).
 *
 * Requires the Customer Portal to be activated in the Stripe dashboard
 * (Settings → Billing → Customer portal).
 */

const STRIPE_API = "https://api.stripe.com/v1";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/billing-portal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY;
        if (!secret) return json({ error: "Payments not configured" }, 503);

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return json({ error: "Unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
        const user = userData.user;

        const admin = supabaseAdmin as unknown as { from: (t: string) => any };
        // Most recent subscription with a Stripe customer id.
        const { data: sub } = await admin
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", user.id)
          .not("stripe_customer_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const customerId = sub?.stripe_customer_id;
        if (!customerId) return json({ error: "No billing account yet" }, 404);

        const origin = request.headers.get("origin") || "https://joinagalink.com";
        const body = new URLSearchParams({
          customer: customerId,
          return_url: `${origin}/billing`,
        }).toString();

        try {
          const resp = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          });
          const session = (await resp.json()) as { url?: string; error?: unknown };
          if (!resp.ok || !session.url) {
            console.error("[billing-portal] Stripe error", session?.error ?? session);
            return json({ error: "Could not open billing portal" }, 502);
          }
          return json({ url: session.url });
        } catch (e) {
          console.error("[billing-portal] request failed", e);
          return json({ error: "Billing portal request failed" }, 502);
        }
      },
    },
  },
});
