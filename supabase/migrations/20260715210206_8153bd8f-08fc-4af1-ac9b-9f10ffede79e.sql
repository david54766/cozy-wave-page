
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id='avatars');

DROP POLICY IF EXISTS "avatars user insert" ON storage.objects;
CREATE POLICY "avatars user insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars user update" ON storage.objects;
CREATE POLICY "avatars user update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars user delete" ON storage.objects;
CREATE POLICY "avatars user delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_user_id, blocked_user_id), CHECK (blocker_user_id <> blocked_user_id));

GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own blocks" ON public.blocked_users;
CREATE POLICY "Manage own blocks" ON public.blocked_users FOR ALL TO authenticated
  USING (auth.uid() = blocker_user_id) WITH CHECK (auth.uid() = blocker_user_id);

CREATE OR REPLACE FUNCTION public.delete_own_account() RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN DELETE FROM auth.users WHERE id = auth.uid(); END; $$;

REVOKE EXECUTE ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
