-- ============================================================================
-- EASY PADHAI: COMPLETE SUPABASE DATABASE SCHEMA & POLICIES
-- Run this script in the Supabase SQL Editor for your project:
-- Project URL: https://bykqlnoftmqclyrtjiyp.supabase.co
-- ============================================================================

-- 1. Create Enums & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Student',
  class_level INTEGER NOT NULL DEFAULT 9,
  board TEXT,
  phone TEXT,
  guardian_phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  school_name TEXT,
  city TEXT,
  state TEXT,
  goal TEXT,
  preferred_language TEXT DEFAULT 'English',
  credits INTEGER NOT NULL DEFAULT 100,
  total_xp INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  UNIQUE(user_id, role)
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  class_level INTEGER NOT NULL DEFAULT 9,
  description TEXT,
  accent TEXT NOT NULL DEFAULT 'blue',
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(subject_id, slug)
);

-- 6. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'video', -- 'video', 'audio', 'pdf'
  video_url TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  summary TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tests Table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Test Attempts Table
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Question Saves (Bookmarks / Saved for Revision)
CREATE TABLE IF NOT EXISTS public.question_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'test',
  selected_index INTEGER,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

-- 12. Lesson Bookmarks Table
CREATE TABLE IF NOT EXISTS public.lesson_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  resource TEXT NOT NULL DEFAULT 'notes',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Lesson Unlocks (Credit System)
CREATE TABLE IF NOT EXISTS public.lesson_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  cost INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

-- 14. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 20,
  minutes_today INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE
);

-- 15. Study Time Tracking
CREATE TABLE IF NOT EXISTS public.study_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  seconds INTEGER NOT NULL DEFAULT 0,
  credited_blocks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. Credit Events Table
CREATE TABLE IF NOT EXISTS public.credit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE UNIQUE INDEX IF NOT EXISTS credit_events_user_ref_key ON public.credit_events (user_id, ref_id) WHERE ref_id IS NOT NULL;

-- 17. XP Events Table
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award'
);

-- 19. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES public.badges(code) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, badge_code)
);

-- 20. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_awarded INTEGER NOT NULL DEFAULT 0,
  qualified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 21. Storage Bucket for Lesson Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-media', 'lesson-media', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Check User Role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Check Staff (Admin or Teacher)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = 'admin' OR role = 'teacher')
  );
END;
$$;

-- Ensure Profile Function
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

  INSERT INTO public.credit_events (user_id, delta, reason, ref_id)
  VALUES (_user_id, 100, 'Welcome bonus', 'welcome')
  ON CONFLICT (user_id, ref_id) DO NOTHING;

  SELECT credits INTO bal FROM public.profiles WHERE id = _user_id;
  RETURN jsonb_build_object('created', created, 'balance', COALESCE(bal, 0));
END;
$$;

-- Award Credits Function
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

-- Signup Trigger
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public read tests" ON public.tests FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);

-- User-Specific Policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own test attempts" ON public.test_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own question saves" ON public.question_saves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.lesson_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own unlocks" ON public.lesson_unlocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study time" ON public.study_time FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own credits" ON public.credit_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own xp" ON public.xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
