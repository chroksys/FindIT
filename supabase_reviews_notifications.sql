-- =============================================
-- Reviews Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (so visitors see them)
CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "Users can insert their own reviews."
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Notifications Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'review',
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Any authenticated user can insert a notification (needed to notify organizers)
CREATE POLICY "Authenticated users can create notifications."
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications."
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
