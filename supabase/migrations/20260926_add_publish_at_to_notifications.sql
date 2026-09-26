-- Migration: Add publish_at column to notifications table for scheduled releases
-- Migration: 20260926_add_publish_at_to_notifications.sql

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ DEFAULT NULL;

-- Index for speedy queries on scheduled release notifications
CREATE INDEX IF NOT EXISTS idx_notifications_publish_at ON public.notifications (publish_at) WHERE publish_at IS NOT NULL;
