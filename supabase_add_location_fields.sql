-- Add country column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country text;
