import { createFileRoute } from "@tanstack/react-router";
import { emailConfigured, sendEmail, emailShell } from "@/lib/server/email";

/**
 * Sends (or re-sends) an invitation email. Called by an admin from the
 * invitations table. Auth: the caller's Supabase JWT must belong to a
 * platform_admin. Requires RESEND_API_KEY (returns 503 otherwise so the UI can
 * fall back to copying the invite link).
 */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const Route = createFileRoute("/api/send-invite")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!emailConfigured()) return json({ error: "Email not configured" }, 503);

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return json({ error: "Unauthorized" }, 401);

        let body: { invitationId?: string };
        try { body = (await request.json()) as { invitationId?: string }; } catch { return json({ error: "Bad request" }, 400); }
        if (!body.invitationId) return json({ error: "Missing invitationId" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

        const admin = supabaseAdmin as unknown as { from: (t: string) => any; rpc: (n: string, a: any) => any };

        // Must be a platform admin.
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "platform_admin" });
        if (!isAdmin) return json({ error: "Forbidden" }, 403);

        const { data: inv } = await admin
          .from("invitations")
          .select("id,email,token,role,status")
          .eq("id", body.invitationId)
          .maybeSingle();
        if (!inv) return json({ error: "Invitation not found" }, 404);

        const link = `https://joinagalink.com/invite/${inv.token}`;
        const result = await sendEmail({
          to: inv.email,
          subject: "You're invited to Alpha Gamma Alpha",
          html: emailShell(
            "You're invited 🎉",
            `<p>You've been invited to join the Alpha Gamma Alpha community.</p>
             <p><a href="${link}" style="display:inline-block;background:#4E89C4;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Accept your invite</a></p>
             <p style="font-size:12px;color:#9aa0a6">Or paste this link: ${link}</p>`,
          ),
        });
        if (!result.ok) return json({ error: result.error ?? "Send failed" }, 502);

        return json({ sent: true, to: inv.email });
      },
    },
  },
});
