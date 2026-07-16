-- 1. Ensure follower_count exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0;

-- 2. Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- can be null if anonymous
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can read page views for their events" ON public.page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = page_views.event_id AND events.host_id = auth.uid())
);

-- 3. Create Trigger to update follower_count
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET follower_count = COALESCE(follower_count, 0) + 1
    WHERE id = NEW.host_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0)
    WHERE id = OLD.host_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_count();
