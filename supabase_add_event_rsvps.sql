-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('going', 'interested')),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (event_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policies for event_rsvps
CREATE POLICY "RSVPs are viewable by everyone." ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can insert their own RSVPs." ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own RSVPs." ON public.event_rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own RSVPs." ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);
