import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, ChevronRight, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SelectRideProps {
  onSelectRide: (ride: any) => void;
  onSoloRide: () => void;
  onBack: () => void;
}

export function SelectRide({ onSelectRide, onSoloRide, onBack }: SelectRideProps) {
  const [todaysRides, setTodaysRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodaysRides();
  }, []);

  const fetchTodaysRides = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rides')
        .select(`
          id, title, route, distance, ride_date, ride_time, max_members, status,
          groups(name),
          participants:ride_participants(user_id)
        `)
        .eq('status', 'upcoming')
        // Ideally filter by today's date, but for demo we fetch all upcoming
        .limit(10);
      
      if (error) throw error;
      setTodaysRides(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Header */}
      <div className="sticky top-14 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 z-40">
        <button onClick={onBack} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold">Select Ride</h2>
          <p className="text-sm text-slate-400">Available rides</p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-6">
        {/* Solo Ride Option */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-400">QUICK START</h3>
          <button
            onClick={onSoloRide}
            className="w-full bg-gradient-to-r from-blue-900 to-green-900 hover:from-blue-800 hover:to-green-800 rounded-xl p-6 border border-blue-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-lg mb-1">Start Solo Ride</h4>
                <p className="text-sm text-blue-300">Ride alone and track your journey</p>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>
        </div>

        {/* Group Rides */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-400">AVAILABLE GROUP RIDES</h3>
          
          {isLoading ? (
            <p className="text-slate-400 text-sm">Loading rides...</p>
          ) : todaysRides.length === 0 ? (
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No group rides scheduled right now</p>
              <p className="text-sm text-slate-500 mt-1">Check back later or start a solo ride.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysRides.map((ride) => (
                <button
                  key={ride.id}
                  onClick={() => onSelectRide(ride)}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl p-4 border border-slate-800 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-blue-400 font-medium mb-1">{ride.groups?.name || 'Independent Ride'}</div>
                      <h4 className="font-bold mb-1">{ride.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{ride.ride_date || 'TBA'}, {ride.ride_time || 'TBA'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-400">{ride.distance || '0 km'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-slate-400">{ride.participants?.length || 0}/{ride.max_members || 10} joined</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-slate-500 mb-1">{ride.route || 'No route specified'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Quick Group */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-400">CREATE QUICK GROUP</h3>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Quick Group Ride</h4>
                <p className="text-xs text-slate-400">Up to 5 riders • No scheduling needed</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-medium transition-colors">
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
