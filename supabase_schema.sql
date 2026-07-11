-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to Supabase Auth)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  subscription text DEFAULT 'Free',
  role text DEFAULT 'Guest',
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  date text,
  display_date text,
  time text,
  display_time text,
  venue text,
  city text,
  distance text,
  banner_url text,
  price text,
  is_paused boolean DEFAULT false,
  is_boosted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for events
CREATE POLICY "Events are viewable by everyone." ON public.events FOR SELECT USING (true);
CREATE POLICY "Hosts can insert their own events." ON public.events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their own events." ON public.events FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their own events." ON public.events FOR DELETE USING (auth.uid() = host_id);
