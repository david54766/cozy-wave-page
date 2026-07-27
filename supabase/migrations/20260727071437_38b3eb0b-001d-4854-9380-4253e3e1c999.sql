REVOKE SELECT ON public.at_risk_members FROM authenticated;
GRANT SELECT (user_id, full_name, status, created_at, last_active_at,
              onboarding_completed, onboarding_incomplete, inactive_14d,
              past_due, trial_ending_soon, active_warnings, post_count)
  ON public.at_risk_members TO authenticated;