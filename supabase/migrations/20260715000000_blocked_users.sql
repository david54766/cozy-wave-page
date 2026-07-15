-- User blocking (Apple Guideline 1.2 — UGC apps must let users block others).
-- A member can block another member; blocked members' posts and messages are
-- hidden from the blocker, and blocked members can't start new conversations
-- with them (enforced in the app + chat RPCs where applicable).

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);

GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- A user manages only their own block list.
DROP POLICY IF EXISTS "Manage own blocks" ON public.blocked_users;
CREATE POLICY "Manage own blocks" ON public.blocked_users
  FOR ALL TO authenticated
  USING (auth.uid() = blocker_user_id)
  WITH CHECK (auth.uid() = blocker_user_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_user_id);
