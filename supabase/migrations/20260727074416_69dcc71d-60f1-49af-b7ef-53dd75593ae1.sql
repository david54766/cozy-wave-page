CREATE OR REPLACE FUNCTION public.can_access_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id AND (
      c.created_by = _user_id
      OR public.has_role(_user_id, 'platform_admin')
      OR EXISTS (SELECT 1 FROM public.conversation_members m WHERE m.conversation_id = c.id AND m.user_id = _user_id)
      OR (c.type = 'space' AND c.space_id IS NOT NULL AND public.is_space_member(c.space_id, _user_id))
    )
  )
$function$;