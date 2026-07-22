-- Safe / Idempotent SQL script for Multi-Host Event Collaborators
CREATE TABLE IF NOT EXISTS event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add unique constraint if not present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_collaborators_event_id_host_id_key'
  ) THEN
    ALTER TABLE event_collaborators ADD CONSTRAINT event_collaborators_event_id_host_id_key UNIQUE (event_id, host_id);
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors when re-running
DROP POLICY IF EXISTS "Public can view accepted collaborations" ON event_collaborators;
DROP POLICY IF EXISTS "Hosts can manage collaborations for their events" ON event_collaborators;
DROP POLICY IF EXISTS "Collaborators can update their own status" ON event_collaborators;
DROP POLICY IF EXISTS "Allow full access to event_collaborators" ON event_collaborators;

-- Create permissive RLS policies for real-time reads, invitations, and status responses
CREATE POLICY "Allow full access to event_collaborators"
  ON event_collaborators FOR ALL
  USING (true)
  WITH CHECK (true);
