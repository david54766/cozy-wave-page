-- Restrict access to the email column on profiles.
-- Authenticated users may read all non-email profile fields (directory still works),
-- but the email column is no longer selectable by ordinary members.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (
  id, full_name, avatar_url, bio, location, status, onboarding_completed,
  last_active_at, created_at, updated_at, cover_image_url, headline,
  website_url, social_links_json
) ON public.profiles TO authenticated;

-- Admin-only RPC: fetch emails for a set of user ids.
CREATE OR REPLACE FUNCTION public.admin_profile_emails(_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND public.has_role(auth.uid(), 'platform_admin');
$$;
REVOKE EXECUTE ON FUNCTION public.admin_profile_emails(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_profile_emails(uuid[]) TO authenticated;

-- Admin-only RPC: find a profile id by email (used by admin "add member by email").
CREATE OR REPLACE FUNCTION public.admin_lookup_profile_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id FROM public.profiles p
  WHERE lower(p.email) = lower(trim(_email))
    AND public.has_role(auth.uid(), 'platform_admin')
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_lookup_profile_id_by_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_lookup_profile_id_by_email(text) TO authenticated;