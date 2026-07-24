// Transactional email sender (Resend HTTP API) — SERVER ONLY.
//
// Requires the secret RESEND_API_KEY. Optional EMAIL_FROM (defaults to a
// joinagalink.com sender — the domain must be verified in Resend). Used for
// invitation emails and email notifications.

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY not set" };
  const from = process.env.EMAIL_FROM || "Alpha Gamma Alpha <noreply@joinagalink.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${t.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Minimal branded wrapper so notification/invite emails look consistent. */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e8eaed">
      <h1 style="font-size:18px;margin:0 0 12px;color:#111">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#333">${bodyHtml}</div>
    </div>
    <p style="text-align:center;font-size:12px;color:#9aa0a6;margin-top:16px">Alpha Gamma Alpha · joinagalink.com</p>
  </div></body></html>`;
}
