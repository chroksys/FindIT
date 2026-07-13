-- Add spatial coordinates to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;
