-- Ensure the follows table exists
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(follower_id, host_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follower can see their own follows (needed by fetchFollowedHosts)
DROP POLICY IF EXISTS "follows_select_follower" ON public.follows;
CREATE POLICY "follows_select_follower"
ON public.follows FOR SELECT USING (auth.uid() = follower_id);

-- Host can see rows where they are the host (needed by Analytics COUNT query)
DROP POLICY IF EXISTS "follows_select_host" ON public.follows;
CREATE POLICY "follows_select_host"
ON public.follows FOR SELECT USING (auth.uid() = host_id);

-- Follower can insert their own follow record
DROP POLICY IF EXISTS "follows_insert" ON public.follows;
CREATE POLICY "follows_insert"
ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Follower can delete their own follow record
DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete"
ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Ensure the notifications table exists (fixes the 400 Bad Request error)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Notification',
  type text NOT NULL DEFAULT 'review',
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure columns exist in case the table was created earlier without them
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Notification';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'review';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications." ON public.notifications;
CREATE POLICY "Authenticated users can create notifications." ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
CREATE POLICY "Users can update their own notifications." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 1. Ensure follower_count exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0;

-- 2. Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Hosts can read page views for their events" ON public.page_views;
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
