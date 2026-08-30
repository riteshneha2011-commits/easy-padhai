-- 1. Duplicate-proof credit history --------------------------------------
DELETE FROM public.credit_events a
USING public.credit_events b
WHERE a.ref_id IS NOT NULL
  AND a.user_id = b.user_id
  AND a.ref_id = b.ref_id
  AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS credit_events_user_ref_key
  ON public.credit_events (user_id, ref_id);

-- 2. Atomic, idempotent credit award -------------------------------------
CREATE OR REPLACE FUNCTION public.award_credits_once(
  _user_id uuid,
  _delta integer,
  _reason text,
  _ref_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cur integer;
  new_balance integer;
  rc integer;
BEGIN
  -- Row lock serialises concurrent awards for the same learner.
  SELECT credits INTO cur FROM public.profiles WHERE id = _user_id FOR UPDATE;
  IF cur IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  IF _delta = 0 THEN
    RETURN jsonb_build_object('balance', cur, 'awarded', 0, 'duplicate', false);
  END IF;

  INSERT INTO public.credit_events (user_id, delta, reason, ref_id)
  VALUES (_user_id, _delta, _reason, _ref_id)
  ON CONFLICT (user_id, ref_id) DO NOTHING;

  GET DIAGNOSTICS rc = ROW_COUNT;
  IF rc = 0 THEN
    -- Already awarded for this reference: no balance change.
    RETURN jsonb_build_object('balance', cur, 'awarded', 0, 'duplicate', true);
  END IF;

  UPDATE public.profiles
     SET credits = GREATEST(credits + _delta, 0)
   WHERE id = _user_id
   RETURNING credits INTO new_balance;

  RETURN jsonb_build_object('balance', new_balance, 'awarded', _delta, 'duplicate', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.award_credits(
  _user_id uuid,
  _delta integer,
  _reason text,
  _ref_id text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  result := public.award_credits_once(_user_id, _delta, _reason, _ref_id);
  RETURN (result->>'balance')::integer;
END;
$$;

-- 3. Self-healing learner profile ----------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_profile(
  _user_id uuid,
  _full_name text DEFAULT NULL,
  _class_level integer DEFAULT 9
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  created boolean := false;
  bal integer;
BEGIN
  INSERT INTO public.profiles (id, full_name, class_level)
  VALUES (_user_id, COALESCE(NULLIF(btrim(_full_name), ''), 'Student'), COALESCE(_class_level, 9))
  ON CONFLICT (id) DO NOTHING;

  IF FOUND THEN
    created := true;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.streaks (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the welcome bonus that the profile default already granted.
  INSERT INTO public.credit_events (user_id, delta, reason, ref_id)
  VALUES (_user_id, 100, 'Welcome bonus', 'welcome')
  ON CONFLICT (user_id, ref_id) DO NOTHING;

  SELECT credits INTO bal FROM public.profiles WHERE id = _user_id;
  RETURN jsonb_build_object('created', created, 'balance', COALESCE(bal, 0));
END;
$$;

-- 4. Keep signup trigger logic in sync -----------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.ensure_profile(
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'class_level')::int, 9)
  );
  RETURN NEW;
END;
$$;

-- 5. Privileged functions stay server-only -------------------------------
REVOKE ALL ON FUNCTION public.award_credits_once(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_credits(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_profile(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_credits_once(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_credits(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_profile(uuid, text, integer) TO service_role;