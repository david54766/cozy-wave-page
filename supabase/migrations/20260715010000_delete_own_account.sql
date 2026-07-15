-- In-app account deletion (Apple 5.1.1(v) / Play requirement), callable from
-- both web and the native app via supabase.rpc('delete_own_account').
--
-- SECURITY DEFINER so it can delete the caller's row from auth.users; the
-- function only ever deletes auth.uid(), so a user can only delete themselves.
-- profiles / roles / preferences / content cascade via ON DELETE CASCADE.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
