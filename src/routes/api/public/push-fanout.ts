import { createFileRoute } from "@tanstack/react-router";
import { loadServiceAccount, sendPush } from "@/lib/server/fcm";
import { emailConfigured, sendEmail, emailShell } from "@/lib/server/email";

/**
 * Push fan-out. Sends a device push whenever an in-app notification is created.
 *
 * Wiring: a Supabase Database Webhook on INSERT of `public.notifications` POSTs
 * here (with header `x-webhook-secret: <PUSH_WEBHOOK_SECRET>`). Both requested
 * cases already write a notification row, so both are covered automatically:
 *   - a new chat message  → `new_message`        (tg_notify_on_message trigger)
 *   - an admin message    → `admin_announcement`  (send_announcement RPC)
 *
 * We push only the types in PUSH_TYPES to avoid notifying on every reaction, and
 * prune tokens FCM reports as dead. Requires FCM_SERVICE_ACCOUNT_JSON +
 * PUSH_WEBHOOK_SECRET secrets. See docs/PUSH-NOTIFICATIONS-SETUP.md.
 */

const PUSH_TYPES = new Set(["new_message", "admin_announcement"]);

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Best-effort in-app deep link for the tapped push. */
function urlForTarget(targetType: unknown, targetId: unknown): string {
  const t = String(targetType ?? "");
  if (t.includes("conversation") || t.includes("message")) return "/chat";
  if (t.includes("post") || t.includes("comment")) return "/feed";
  if (t.includes("event")) return "/events";
  return "/dashboard";
}

export const Route = createFileRoute("/api/public/push-fanout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PUSH_WEBHOOK_SECRET;
        if (!secret) return json(503, { error: "Push webhook not configured" });
        if (request.headers.get("x-webhook-secret") !== secret) {
          return json(401, { error: "unauthorized" });
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return json(400, { error: "invalid json" });
        }

        // Supabase DB webhook shape: { type, table, schema, record, old_record }
        const record = payload?.record ?? payload?.data?.record;
        if (payload?.type && payload.type !== "INSERT") return json(200, { skipped: "not insert" });
        if (!record) return json(200, { skipped: "no record" });

        const type = String(record.type ?? "");
        const userId = record.user_id as string | undefined;
        if (!PUSH_TYPES.has(type)) return json(200, { skipped: `type ${type}` });
        if (!userId) return json(200, { skipped: "no recipient" });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as { from: (t: string) => any };

        const { data: pref } = await admin
          .from("user_preferences")
          .select("push_notifications_enabled, email_notifications_enabled")
          .eq("user_id", userId)
          .maybeSingle();

        const title = String(record.title || "Alpha Gamma Alpha");
        const body = String(record.body || "");
        const url = urlForTarget(record.target_type, record.target_id);
        const out: Record<string, unknown> = { type };

        // --- Push channel (opt-in + Firebase configured) ---
        const sa = loadServiceAccount();
        if (pref?.push_notifications_enabled && sa) {
          const { data: tokenRows } = await admin
            .from("device_push_tokens")
            .select("token")
            .eq("user_id", userId);
          const tokens = (tokenRows ?? []).map((r: any) => r.token as string).filter(Boolean);
          if (tokens.length) {
            const results = await sendPush(sa, tokens, { title, body, url });
            const dead = results.filter((r) => r.dead).map((r) => r.token);
            if (dead.length) {
              try { await admin.from("device_push_tokens").delete().in("token", dead); } catch { /* non-fatal */ }
            }
            out.push = { sent: results.filter((r) => r.ok).length, pruned: dead.length };
          }
        }

        // --- Email channel (opt-in + Resend configured) ---
        if (pref?.email_notifications_enabled && emailConfigured()) {
          const { data: prof } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
          if (prof?.email) {
            const link = `https://joinagalink.com${url}`;
            const r = await sendEmail({
              to: prof.email,
              subject: title,
              html: emailShell(title, `<p>${body}</p><p><a href="${link}" style="color:#4E89C4">Open in Alpha Gamma Alpha →</a></p>`),
            });
            out.email = r.ok ? "sent" : r.error;
          }
        }

        return json(200, out);
      },
    },
  },
});
