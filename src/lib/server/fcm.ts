// Firebase Cloud Messaging (HTTP v1) sender — SERVER ONLY.
//
// Authenticates with a Firebase *service account* (OAuth2 JWT-bearer flow) and
// sends a notification to one or more device tokens, reporting which tokens are
// dead so the caller can prune them. Runs in the Workers/edge runtime using Web
// Crypto (same approach as the Stripe webhook's HMAC verification).
//
// Requires the secret FCM_SERVICE_ACCOUNT_JSON = the full service-account JSON
// (Firebase Console → Project settings → Service accounts → Generate new private
// key). The legacy "server key" is deprecated; v1 uses the service account.

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string; // optional in-app deep link, delivered as data.url
}

export interface SendResult {
  token: string;
  ok: boolean;
  dead: boolean; // token is invalid/unregistered → caller should delete it
  error?: string;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const b64urlStr = (s: string) => b64url(new TextEncoder().encode(s));

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// Cache the OAuth token in module scope (reused within an isolate's lifetime).
let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64urlStr(JSON.stringify(header))}.${b64urlStr(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token) {
    throw new Error(`FCM token exchange failed: ${JSON.stringify(json)}`);
  }
  cachedToken = { token: json.access_token, exp: now + (json.expires_in ?? 3600) };
  return cachedToken.token;
}

/** Read + validate the service account from env. Returns null if unset/invalid. */
export function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as Partial<ServiceAccount>;
    if (sa.client_email && sa.private_key && sa.project_id) {
      return { client_email: sa.client_email, private_key: sa.private_key, project_id: sa.project_id };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Send one notification to many tokens. One HTTP call per token (v1 is unicast). */
export async function sendPush(
  sa: ServiceAccount,
  tokens: string[],
  payload: PushPayload,
): Promise<SendResult[]> {
  if (tokens.length === 0) return [];
  const accessToken = await getAccessToken(sa);
  const endpoint = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
  const results: SendResult[] = [];

  for (const token of tokens) {
    const message = {
      message: {
        token,
        notification: { title: payload.title, body: payload.body },
        ...(payload.url ? { data: { url: payload.url } } : {}),
        android: { priority: "high", notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
      },
    };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (res.ok) {
        results.push({ token, ok: true, dead: false });
        continue;
      }
      const err = (await res.json().catch(() => ({}))) as { error?: { status?: string } };
      const status = err?.error?.status;
      const dead =
        res.status === 404 ||
        status === "NOT_FOUND" ||
        status === "UNREGISTERED" ||
        status === "INVALID_ARGUMENT";
      results.push({ token, ok: false, dead, error: status || `HTTP ${res.status}` });
    } catch (e) {
      results.push({ token, ok: false, dead: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}
