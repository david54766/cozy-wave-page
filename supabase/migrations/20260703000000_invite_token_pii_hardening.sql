-- Invite-token privacy hardening.
--
-- Problem: lookup_invitation_by_token() / lookup_invite_link_by_token() are
-- callable by the anon role and return the invitee's email and the admin's
-- personal message. Anyone holding (or guessing) a token URL could read that
-- PII without authenticating.
--
-- Fix: keep the anon-facing preview (space name, role, validity) so the invite
-- landing page still renders for logged-out visitors, but only include email
-- and personal_message when the caller is authenticated. The frontend
-- (src/routes/invite.$token.tsx) already gates those fields behind login.

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
    'found', true,
    'id', v.id,
    'role', v.role,
    'space_id', v.space_id,
    'space_name', v_space_name,
    'status', v.status,
    'expires_at', v.expires_at,
    -- PII: only surfaced to authenticated callers.
    'email', CASE WHEN v_is_auth THEN v.email ELSE NULL END,
    'personal_message', CASE WHEN v_is_auth THEN v.personal_message ELSE NULL END
  );
END $$;

CREATE OR REPLACE FUNCTION public.lookup_invite_link_by_token(_token TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.invite_links%ROWTYPE;
  v_space_name TEXT;
BEGIN
  SELECT * INTO v FROM public.invite_links WHERE token = _token;
  IF NOT FOUND THEN RETURN jsonb_build_object('found', false); END IF;
  IF v.space_id IS NOT NULL THEN
    SELECT name INTO v_space_name FROM public.spaces WHERE id = v.space_id;
  END IF;
  RETURN jsonb_build_object(
    'found', true,
    'id', v.id,
    'name', v.name,
    'role', v.role,
    'space_id', v.space_id,
    'space_name', v_space_name,
    'active', v.active,
    'expires_at', v.expires_at,
    'max_uses', v.max_uses,
    'uses_count', v.uses_count
  );
END $$;

-- Grants unchanged (anon + authenticated) so the preview still works; the
-- functions themselves now decide what anon may see.
GRANT EXECUTE ON FUNCTION public.lookup_invitation_by_token(TEXT)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_invite_link_by_token(TEXT) TO anon, authenticated;
