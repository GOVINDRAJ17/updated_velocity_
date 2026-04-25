import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface RideContextType {
  allRides: any[];
  myRides: any[];
  discoverRides: any[];
  isLoading: boolean;
  refreshRides: () => Promise<void>;
  getRideStatus: (ride: any) => 'upcoming' | 'active' | 'past';
  joinRide: (rideId: string) => Promise<{ success: boolean; error?: string }>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const [allRides, setAllRides] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [discoverRides, setDiscoverRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getRideStatus = (ride: any) => {
    const now = new Date();
    const start = ride.start_datetime ? new Date(ride.start_datetime) : null;
    const end = ride.end_datetime ? new Date(ride.end_datetime) : null;

    if (!start) return (ride.status || 'upcoming') as 'upcoming' | 'active' | 'past';
    
    if (now < start) return 'upcoming';
    if (end && now > end) return 'past';
    return 'active';
  };

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data, error } = await supabase
        .from('rides')
        .select(`
          id, title, route, start_location, end_location, start_lat, start_lng, end_lat, end_lng, 
          distance, ride_date, ride_time, start_datetime, end_datetime, max_members, status, 
          image_url, coordinates, access_code, created_at,
          groups(name),
          driver:profiles!driver_id(id, full_name, username, avatar_url, level_name),
          participants:ride_participants(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Ride fetch error:", error);
        return;
      }

      const ridesData = data || [];
      setAllRides(ridesData);

      if (userId) {
        const mine = ridesData.filter(r => 
          r.driver?.id === userId || 
          r.participants.some((p: any) => p.user_id === userId)
        );
        const discover = ridesData.filter(r => 
          r.driver?.id !== userId && 
          !r.participants.some((p: any) => p.user_id === userId) &&
          getRideStatus(r) !== 'past'
        );
        
        setMyRides(mine);
        setDiscoverRides(discover);
      } else {
        setMyRides([]);
        setDiscoverRides(ridesData.filter(r => getRideStatus(r) !== 'past'));
      }
    } catch (err) {
      console.error("Critical context error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRide = async (rideId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Authentication required');

      const ride = allRides.find(r => r.id === rideId);
      if (ride && getRideStatus(ride) === 'past') {
        throw new Error('This ride has ended and cannot be joined.');
      }

      if (ride && (ride.participants?.length || 0) >= ride.max_members) {
        throw new Error('Formation is at full capacity.');
      }

      const { error } = await supabase.from('ride_participants').insert([{
        ride_id: rideId,
        user_id: session.user.id
      }]);

      if (error) {
        if (error.code === '23505') return { success: true };
        throw error;
      }
      
      await fetchRides();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return (
    <RideContext.Provider value={{ 
      allRides, 
      myRides, 
      discoverRides, 
      isLoading, 
      refreshRides: fetchRides,
      getRideStatus,
      joinRide
    }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRides() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRides must be used within a RideProvider');
  }
  return context;
}
