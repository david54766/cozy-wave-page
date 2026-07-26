CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_push_tokens TO authenticated;
GRANT ALL ON public.device_push_tokens TO service_role;

ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='device_push_tokens' AND policyname='Users manage own device tokens') THEN
    CREATE POLICY "Users manage own device tokens" ON public.device_push_tokens
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='device_push_tokens' AND policyname='Admins manage all device tokens') THEN
    CREATE POLICY "Admins manage all device tokens" ON public.device_push_tokens
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'platform_admin'))
      WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS device_push_tokens_user_id_idx ON public.device_push_tokens(user_id);

DROP TRIGGER IF EXISTS update_device_push_tokens_updated_at ON public.device_push_tokens;
CREATE TRIGGER update_device_push_tokens_updated_at
  BEFORE UPDATE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();