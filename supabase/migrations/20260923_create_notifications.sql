-- ============================================================================
-- EASY PADHAI: NOTIFICATIONS SYSTEM & REALTIME ENABLEMENT
-- Migration: 20260923_create_notifications.sql
-- ============================================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  target_class INTEGER, -- null = All Classes (9-12), or specific 9, 10, 11, 12
  target_subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'broadcast', -- 'broadcast', 'lecture', 'chapter', 'challenge'
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy queries by class and creation date
CREATE INDEX IF NOT EXISTS idx_notifications_target_class ON public.notifications (target_class);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- 2. Create Notification Reads Table (Tracks which users read which notifications)
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads (user_id);

-- 3. Row Level Security Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Notifications can be read by authenticated users and anon users
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON public.notifications;
CREATE POLICY "Notifications are viewable by everyone"
  ON public.notifications FOR SELECT
  USING (true);

-- Notifications can only be created/updated/deleted by staff/admins
DROP POLICY IF EXISTS "Staff can insert notifications" ON public.notifications;
CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'teacher')
    )
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Staff can delete notifications" ON public.notifications;
CREATE POLICY "Staff can delete notifications"
  ON public.notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'teacher')
    )
    OR auth.role() = 'service_role'
  );

-- Notification Reads Policies
DROP POLICY IF EXISTS "Users can view their own read receipts" ON public.notification_reads;
CREATE POLICY "Users can view their own read receipts"
  ON public.notification_reads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark notifications as read" ON public.notification_reads;
CREATE POLICY "Users can mark notifications as read"
  ON public.notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Enable Supabase Realtime for Notifications and Lessons
-- This allows clients to receive instant WebSocket updates when records are added or updated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lessons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chapters'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN others THEN NULL;
END $$;
