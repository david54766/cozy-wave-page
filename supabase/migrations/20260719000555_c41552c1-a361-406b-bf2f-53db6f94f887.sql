DROP POLICY IF EXISTS "profiles public read" ON storage.objects;
CREATE POLICY "profiles public read" ON storage.objects FOR SELECT USING (bucket_id='profiles');

DROP POLICY IF EXISTS "profiles user insert" ON storage.objects;
CREATE POLICY "profiles user insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profiles user update" ON storage.objects;
CREATE POLICY "profiles user update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profiles user delete" ON storage.objects;
CREATE POLICY "profiles user delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='profiles' AND (storage.foldername(name))[1] = auth.uid()::text);