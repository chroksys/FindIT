-- Add demographic columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS phone text;
