
-- Revoke blanket SELECT and re-grant only non-sensitive columns to authenticated/anon
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (id, full_name, avatar_url, cover_image_url, bio, location, headline, website_url, social_links_json, status, onboarding_completed, created_at, updated_at, last_active_at) ON public.profiles TO authenticated;
GRANT SELECT (id, full_name, avatar_url, cover_image_url, bio, location, headline, website_url, social_links_json, status, created_at) ON public.profiles TO anon;

-- Replace the overly-permissive SELECT policy with owner/admin scoping for full-row (including email) access
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Public profile fields readable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners and admins can read own profile with email"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'platform_admin'::app_role));
