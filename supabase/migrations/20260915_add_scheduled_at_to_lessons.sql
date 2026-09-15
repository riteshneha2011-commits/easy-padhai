-- Migration: Add optional scheduled_at column to lessons table
-- If executed directly in Supabase SQL editor, this allows native column queries.
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT NULL;

-- Index for scheduled release queries
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at ON public.lessons (scheduled_at) WHERE scheduled_at IS NOT NULL;
