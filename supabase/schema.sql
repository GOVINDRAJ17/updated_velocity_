-- User Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  gender TEXT,
  dob DATE,
  avatar_url TEXT,
  
  -- Ride Identity
  bike_model TEXT,
  vehicle_type TEXT DEFAULT 'Bike',
  number_plate TEXT,
  plate_private BOOLEAN DEFAULT false,
  riding_style TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'Beginner',
  
  -- Stats
  level_name TEXT DEFAULT 'Rider',
  level INT DEFAULT 1,
  total_distance INT DEFAULT 0,
  total_time INT DEFAULT 0,
  routes_completed INT DEFAULT 0,
  points INT DEFAULT 0,
    
   -- Payment Identity
   upi_id TEXT,
   wallet_balance DECIMAL(12, 2) DEFAULT 0,
   
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: User MUST manually execute this in Supabase SQL editor:
-- CREATE BUCKET avatars
-- insert policy to allow public select and auth insert

-- Groups/Clubs
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Rides
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id), -- Optional
  driver_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  start_location TEXT,
  end_location TEXT,
  route TEXT,
  distance TEXT,
  ride_date DATE,
  ride_time TIME,
  meeting_point TEXT,
  max_members INT DEFAULT 10,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed
  coordinates JSONB, -- [lat, lng]
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Participants (Join Table)
CREATE TABLE public.ride_participants (
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ride_id, user_id)
);

-- Transactions Table (Unified Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('wallet_credit', 'wallet_debit', 'split_pay', 'split_receive')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  split_id UUID REFERENCES public.splits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for public reading
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Groups are viewable by everyone." ON public.groups FOR SELECT USING (true);
CREATE POLICY "Rides are viewable by everyone." ON public.rides FOR SELECT USING (true);
CREATE POLICY "Ride participants are viewable by everyone." ON public.ride_participants FOR SELECT USING (true);

-- Policies for authenticated updates
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can create rides." ON public.rides FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can update their rides." ON public.rides FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Authenticated users can join rides." ON public.ride_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rides." ON public.ride_participants FOR DELETE USING (auth.uid() = user_id);

-- Dummy Seed Data Function (Run to populate frontend mock data in cloud)
INSERT INTO public.groups (name, description, image_url) VALUES 
('Mumbai Riders Club', 'A coastal club for bike enthusiasts.', 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400&h=300&fit=crop'),
('Weekend Warriors', 'Mountain trail riders.', 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop');
