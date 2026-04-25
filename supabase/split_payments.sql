-- Split Payments Table
CREATE TABLE IF NOT EXISTS public.splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Split Members Table
CREATE TABLE IF NOT EXISTS public.split_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id UUID REFERENCES public.splits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries for the same user in the same split
  UNIQUE(split_id, user_id)
);

-- Enable RLS
ALTER TABLE public.splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Splits are viewable by anyone in the ride." 
ON public.splits FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ride_participants 
    WHERE ride_id = splits.ride_id AND user_id = auth.uid()
  ) OR created_by = auth.uid()
);

CREATE POLICY "Anyone in the ride can create a split." 
ON public.splits FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ride_participants 
    WHERE ride_id = ride_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.rides 
    WHERE id = ride_id AND driver_id = auth.uid()
  )
);

CREATE POLICY "Split members are viewable by everyone in the split." 
ON public.split_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.splits 
    WHERE id = split_id AND (
      EXISTS (
        SELECT 1 FROM public.ride_participants 
        WHERE ride_id = splits.ride_id AND user_id = auth.uid()
      ) OR created_by = auth.uid()
    )
  )
);

CREATE POLICY "Creators can add members to splits." 
ON public.split_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.splits 
    WHERE id = split_id AND created_by = auth.uid()
  )
);

CREATE POLICY "System/Admin can update payment status." 
ON public.split_members FOR UPDATE 
USING (true)
WITH CHECK (true);
