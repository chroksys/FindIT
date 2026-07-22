-- Safe / Idempotent SQL script for Multi-Host Event Collaborators

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add columns if missing (in case table existed from earlier setup)
ALTER TABLE event_collaborators 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Add unique constraint if not present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_collaborators_event_id_host_id_key'
  ) THEN
    ALTER TABLE event_collaborators ADD CONSTRAINT event_collaborators_event_id_host_id_key UNIQUE (event_id, host_id);
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view accepted collaborations" ON event_collaborators;
DROP POLICY IF EXISTS "Hosts can manage collaborations for their events" ON event_collaborators;
DROP POLICY IF EXISTS "Collaborators can update their own status" ON event_collaborators;
DROP POLICY IF EXISTS "Allow full access to event_collaborators" ON event_collaborators;

CREATE POLICY "Allow full access to event_collaborators"
  ON event_collaborators FOR ALL
  USING (true)
  WITH CHECK (true);

