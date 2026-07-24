import { createFileRoute } from "@tanstack/react-router";
import { loadServiceAccount, sendPush } from "@/lib/server/fcm";

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

        const sa = loadServiceAccount();
        if (!sa) return json(503, { error: "FCM service account not configured" });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as { from: (t: string) => any };

        const { data: tokenRows } = await admin
          .from("device_push_tokens")
          .select("token")
          .eq("user_id", userId);
        const tokens = (tokenRows ?? []).map((r: any) => r.token as string).filter(Boolean);
        if (tokens.length === 0) return json(200, { skipped: "no devices" });

        const results = await sendPush(sa, tokens, {
          title: String(record.title || "AGA"),
          body: String(record.body || ""),
          url: urlForTarget(record.target_type, record.target_id),
        });

        const dead = results.filter((r) => r.dead).map((r) => r.token);
        if (dead.length) {
          try {
            await admin.from("device_push_tokens").delete().in("token", dead);
          } catch {
            /* non-fatal */
          }
        }

        return json(200, {
          type,
          sent: results.filter((r) => r.ok).length,
          failed: results.filter((r) => !r.ok).length,
          pruned: dead.length,
        });
      },
    },
  },
});
