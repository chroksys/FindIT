-- Create the live feed messages table
CREATE TABLE IF NOT EXISTS live_feed_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT,
    image_url TEXT,
    is_host BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE live_feed_messages ENABLE ROW LEVEL SECURITY;

-- Policies for live_feed_messages
DROP POLICY IF EXISTS "Anyone can view live feed messages" ON live_feed_messages;
CREATE POLICY "Anyone can view live feed messages" ON live_feed_messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON live_feed_messages;
CREATE POLICY "Authenticated users can insert messages" ON live_feed_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON live_feed_messages;
CREATE POLICY "Users can delete own messages" ON live_feed_messages
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hosts can delete any message in their event" ON live_feed_messages;
CREATE POLICY "Hosts can delete any message in their event" ON live_feed_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = live_feed_messages.event_id
            AND events.host_id = auth.uid()
        )
    );

-- Enable real-time for live_feed_messages
-- ALTER PUBLICATION supabase_realtime ADD TABLE live_feed_messages; -- (Already enabled usually, ignoring duplicate)

-- Create Storage Bucket for live feed images
INSERT INTO storage.buckets (id, name, public) VALUES ('live-feed-images', 'live-feed-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for live-feed-images
DROP POLICY IF EXISTS "Live feed images are publicly accessible" ON storage.objects;
CREATE POLICY "Live feed images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'live-feed-images');

DROP POLICY IF EXISTS "Authenticated users can upload live feed images" ON storage.objects;
CREATE POLICY "Authenticated users can upload live feed images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'live-feed-images');

DROP POLICY IF EXISTS "Authenticated users can update live feed images" ON storage.objects;
CREATE POLICY "Authenticated users can update live feed images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'live-feed-images');
