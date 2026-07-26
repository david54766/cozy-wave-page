
CREATE TABLE IF NOT EXISTS public._webhook_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON public._webhook_config FROM PUBLIC, anon, authenticated;
GRANT ALL ON public._webhook_config TO service_role;
ALTER TABLE public._webhook_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tg_notifications_push_fanout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_secret TEXT;
BEGIN
  SELECT value INTO v_secret FROM public._webhook_config WHERE key = 'push_webhook_secret';
  IF v_secret IS NULL OR v_secret = '' THEN
    RETURN NEW;
  END IF;

  PERFORM extensions.http_post(
    url     := 'https://joinagalink.com/api/public/push-fanout',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_secret
    ),
    body    := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'schema', 'public',
      'record', to_jsonb(NEW),
      'old_record', NULL
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_push_fanout ON public.notifications;
CREATE TRIGGER notifications_push_fanout
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.tg_notifications_push_fanout();
