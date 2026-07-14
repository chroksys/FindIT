-- Add currency and VIP price columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS vip_price text;
