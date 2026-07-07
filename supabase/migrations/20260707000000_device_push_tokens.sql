-- Stores per-device push tokens so a server-side sender can deliver Firebase
-- (FCM) push notifications to a member's devices. The app upserts the current
-- device's token here after the user grants notification permission
-- (see src/lib/push.ts). Safe to run before push is fully live.

CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  platform   text NOT NULL DEFAULT 'android',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_push_tokens TO authenticated;
GRANT ALL ON public.device_push_tokens TO service_role;
ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

-- Members manage only their own device tokens; a service-role sender can read all.
DROP POLICY IF EXISTS "Manage own device tokens" ON public.device_push_tokens;
CREATE POLICY "Manage own device tokens" ON public.device_push_tokens
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user ON public.device_push_tokens(user_id);
