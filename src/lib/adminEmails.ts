import { supabase } from "@/integrations/supabase/client";

/** Admin-only: fetch a map of user_id -> email. Returns empty map for non-admins. */
export async function fetchAdminEmails(ids: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data, error } = await (supabase.rpc as any)("admin_profile_emails", { _ids: unique });
  if (error || !data) return {};
  const map: Record<string, string> = {};
  (data as Array<{ id: string; email: string | null }>).forEach((r) => {
    if (r.email) map[r.id] = r.email;
  });
  return map;
}

/** Admin-only: look up a profile id by email. */
export async function lookupProfileIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await (supabase.rpc as any)("admin_lookup_profile_id_by_email", {
    _email: email.trim(),
  });
  if (error) return null;
  return (data as string | null) ?? null;
}
