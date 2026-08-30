-- Trigger + privileged functions must not be callable through the API
REVOKE EXECUTE ON FUNCTION public.apply_xp() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_referral_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_owner_email() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_referral_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_credits(uuid, integer, text, text) FROM anon, authenticated;

-- Role-check helpers stay callable only by signed-in users (needed by RLS policies and the app)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated, service_role;