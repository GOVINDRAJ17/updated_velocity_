-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view chat messages for rides" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id OR is_system = true);

-- Enable real-time replication for the table
-- Go to Supabase Dashboard -> Database -> Replication -> Enable for chat_messages
-- Or run:
alter publication supabase_realtime add table public.chat_messages;
