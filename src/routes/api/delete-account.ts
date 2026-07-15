import { createFileRoute } from "@tanstack/react-router";

/**
 * In-app account deletion (Apple Guideline 5.1.1(v) / Google Play requirement).
 *
 * Verifies the caller's Supabase JWT, then permanently deletes their auth user.
 * profiles / user_roles / preferences / content rows reference auth.users with
 * ON DELETE CASCADE, so removing the auth user cleans up their data.
 */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/delete-account")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return json({ error: "Unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !userData?.user) return json({ error: "Unauthorized" }, 401);

        const userId = userData.user.id;
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (delErr) {
          console.error("[delete-account]", delErr);
          return json({ error: "Could not delete account" }, 500);
        }
        return json({ deleted: true });
      },
    },
  },
});
