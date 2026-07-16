-- Migration: Add parent_event_id to support Sub-Events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS parent_event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;
