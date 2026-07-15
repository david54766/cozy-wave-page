import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export interface BlockedMember {
  blocked_user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/** IDs of members the current user has blocked. */
export async function fetchMyBlockedIds(userId: string): Promise<Set<string>> {
  const { data } = await db
    .from("blocked_users")
    .select("blocked_user_id")
    .eq("blocker_user_id", userId);
  return new Set((data ?? []).map((r: { blocked_user_id: string }) => r.blocked_user_id));
}

/** Blocked members with profile info, for the management list. */
export async function fetchMyBlockedMembers(userId: string): Promise<BlockedMember[]> {
  const { data } = await db
    .from("blocked_users")
    .select("blocked_user_id")
    .eq("blocker_user_id", userId);
  const ids = (data ?? []).map((r: { blocked_user_id: string }) => r.blocked_user_id);
  if (!ids.length) return [];
  const { data: profiles } = await db
    .from("profiles")
    .select("id,full_name,avatar_url")
    .in("id", ids);
  return (profiles ?? []).map((p: any) => ({
    blocked_user_id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
  }));
}

export async function blockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
  const { error } = await db
    .from("blocked_users")
    .insert({ blocker_user_id: blockerUserId, blocked_user_id: blockedUserId });
  // Ignore duplicate-block errors (already blocked).
  if (error && !String(error.message ?? "").toLowerCase().includes("duplicate")) throw error;
}

export async function unblockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
  const { error } = await db
    .from("blocked_users")
    .delete()
    .eq("blocker_user_id", blockerUserId)
    .eq("blocked_user_id", blockedUserId);
  if (error) throw error;
}

export async function isBlocked(blockerUserId: string, blockedUserId: string): Promise<boolean> {
  const { data } = await db
    .from("blocked_users")
    .select("id")
    .eq("blocker_user_id", blockerUserId)
    .eq("blocked_user_id", blockedUserId)
    .maybeSingle();
  return !!data;
}
