-- 1. Restore signup trigger: new users get profile + member role + preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1b. Backfill users created while the trigger was missing
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'member'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

INSERT INTO public.user_preferences (user_id)
SELECT u.id FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_preferences pr WHERE pr.user_id = u.id);

INSERT INTO public.notification_preferences (user_id)
SELECT u.id FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.notification_preferences np WHERE np.user_id = u.id);

-- 2. Enable realtime for the notification bell
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END;
$$;

-- 3. Invite-token privacy: hide invitee email + personal message from anonymous callers
CREATE OR REPLACE FUNCTION public.lookup_invitation_by_token(_token TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.invitations%ROWTYPE;
  v_space_name TEXT;
  v_is_auth BOOLEAN := auth.uid() IS NOT NULL;
BEGIN
  SELECT * INTO v FROM public.invitations WHERE token = _token;
  IF NOT FOUND THEN RETURN jsonb_build_object('found', false); END IF;
  IF v.space_id IS NOT NULL THEN
    SELECT name INTO v_space_name FROM public.spaces WHERE id = v.space_id;
  END IF;
  RETURN jsonb_build_object(
    'found', true, 'id', v.id, 'role', v.role,
    'space_id', v.space_id, 'space_name', v_space_name,
    'status', v.status, 'expires_at', v.expires_at,
    'email', CASE WHEN v_is_auth THEN v.email ELSE NULL END,
    'personal_message', CASE WHEN v_is_auth THEN v.personal_message ELSE NULL END
  );
END;
$$;