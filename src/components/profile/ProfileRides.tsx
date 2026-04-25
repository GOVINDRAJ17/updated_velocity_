import { MapPin, Plus, Activity, Clock, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileRidesProps {
  authoredRides: any[];
  onEditRide: (ride: any) => void;
  isDark: boolean;
}

export function ProfileRides({ authoredRides, onEditRide, isDark }: ProfileRidesProps) {
  const navigate = useNavigate();
  
  return (
    <div className="px-5 mb-8 relative z-10">
      <div className="flex items-center justify-between mb-5">
         <h3 className="font-black text-[15px] uppercase tracking-widest text-slate-400 flex items-center gap-2 pl-2">
           <MapPin className="w-5 h-5 text-blue-500"/> My Routes
         </h3>
         <button 
           onClick={() => navigate('/start')}
           className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-all active:scale-95"
         >
           <Plus className="w-5 h-5 text-blue-400" />
         </button>
      </div>
      {authoredRides.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 text-center border border-white/5 border-dashed shadow-inner">
          <Activity className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-400 text-sm font-medium">You haven't authored any routes yet. Tap Start Ride to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {authoredRides.map((ride, i) => (
            <div key={i} className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/5 transition-all shadow-lg">
              {/* Minimal Edit Button */}
              <button 
                onClick={() => onEditRide(ride)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-90"
              >
                <Edit3 className="w-4 h-4 text-slate-300" />
              </button>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{ride.title || 'Unknown Route'}</div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> 
                    {ride.start_location?.split(',')[0]} ➔ {ride.end_location?.split(',')[0]}
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Clock className="w-3 h-3"/> {ride.ride_date} @ {ride.ride_time?.substring(0,5)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-300 px-4 py-2 rounded-2xl text-xs font-black border border-blue-500/10 shadow-inner mr-8">
                  {ride.distance ? ride.distance : 'TBD'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
