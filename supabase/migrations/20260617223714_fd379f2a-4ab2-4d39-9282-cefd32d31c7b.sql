DROP POLICY IF EXISTS "Read points ledger" ON public.points_ledger;
CREATE POLICY "Users view own points" ON public.points_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all points" ON public.points_ledger FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'));