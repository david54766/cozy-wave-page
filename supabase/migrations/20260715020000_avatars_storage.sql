-- Storage bucket for user-uploaded images (avatars + profile cover images),
-- so members can upload from their device instead of pasting a URL. Public-read
-- (images are shown across the community); each user can only write files under
-- their own folder ("<user_id>/...").

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (bucket is public).
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- A user may write/update/delete only within their own top-level folder.
DROP POLICY IF EXISTS "avatars user insert" ON storage.objects;
CREATE POLICY "avatars user insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars user update" ON storage.objects;
CREATE POLICY "avatars user update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars user delete" ON storage.objects;
CREATE POLICY "avatars user delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
