ALTER VIEW public.at_risk_members SET (security_invoker = false);
GRANT SELECT ON public.at_risk_members TO authenticated;