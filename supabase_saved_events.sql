-- Create saved_events junction table
CREATE TABLE public.saved_events (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

-- Policies for saved_events
CREATE POLICY "Users can view their own saved events." 
  ON public.saved_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save events for themselves." 
  ON public.saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own events." 
  ON public.saved_events FOR DELETE USING (auth.uid() = user_id);
