DROP POLICY IF EXISTS "Create conversations" ON public.conversations;

CREATE POLICY "Create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Insert member to accessible conv" ON public.conversation_members;

CREATE POLICY "Insert member to accessible conv" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'platform_admin')
    OR EXISTS (SELECT 1 FROM public.conversations c
               WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );