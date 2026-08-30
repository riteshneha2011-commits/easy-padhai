REVOKE EXECUTE ON FUNCTION public.apply_xp() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_owner_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.gen_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_credits(uuid, integer, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.apply_xp() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_admin_for_owner_email() TO service_role;
GRANT EXECUTE ON FUNCTION public.gen_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.award_credits(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated, service_role;