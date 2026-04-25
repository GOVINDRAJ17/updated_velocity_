import { useState, useEffect, useMemo } from 'react';
import {
  Search, MapPin, Users, Info, ChevronRight,
  ChevronDown, ChevronUp, Clock, Navigation, Thermometer,
  Zap, Calendar, Radio, Share2
} from 'lucide-react';
import { fetchWeather, WeatherData } from '../lib/weather';
import { useTheme } from '../contexts/ThemeContext';
import { useRides } from '../contexts/RideContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { isFillingFast, getWhatsAppShareUrl, getBestTimeToLeave } from '../lib/insights';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

import { useNavigate } from 'react-router-dom';

export function Groups() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { allRides, discoverRides, myRides, isLoading, refreshRides, joinRide, getRideStatus } = useRides();
  const { success, error, toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoiningLocal, setIsJoiningLocal] = useState<string | null>(null);
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<Record<string, { start: WeatherData | null; end: WeatherData | null }>>({});
  const [session, setSession] = useState<any>(null);

  // Passcode Modal State
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [targetRideForPasscode, setTargetRideForPasscode] = useState<any>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const isDark = theme !== 'light';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
  }, []);

  useEffect(() => {
    if (expandedRideId) {
      const ride = allRides.find(r => r.id === expandedRideId);
      if (ride && !weatherData[ride.id]) fetchRideWeather(ride);
    }
  }, [expandedRideId]);

  const fetchRideWeather = async (ride: any) => {
    const [start, end] = await Promise.all([
      fetchWeather(ride.start_location),
      fetchWeather(ride.end_location)
    ]);
    setWeatherData(prev => ({ ...prev, [ride.id]: { start, end } }));
  };

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredDiscover = useMemo(() =>
    discoverRides.filter(ride => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        (ride.title || '').toLowerCase().includes(q) ||
        (ride.start_location || '').toLowerCase().includes(q) ||
        (ride.end_location || '').toLowerCase().includes(q)
      );
    }),
    [discoverRides, debouncedSearch]
  );

  const handleJoinAction = async (rideId: string, providedCode?: string) => {
    setIsJoiningLocal(rideId);
    const res = await joinRide(rideId);
    if (res.success) {
      success('Successfully joined the formation!');
      setShowPasscodeModal(false);
      setPasscode('');
      setTargetRideForPasscode(null);
    } else {
      error(res.error || 'Failed to join.');
    }
    setIsJoiningLocal(null);
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!targetRideForPasscode) return;
      
      if (targetRideForPasscode.access_code?.toUpperCase() !== passcode.toUpperCase()) {
          setPasscodeError(true);
          return;
      }
      
      await handleJoinAction(targetRideForPasscode.id, passcode);
  };

  const handleInitialJoinClick = async (ride: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (ride.access_code) {
        setTargetRideForPasscode(ride);
        setShowPasscodeModal(true);
    } else {
        await handleJoinAction(ride.id);
    }
  };

  const bg = isDark ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-black/40 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm';

  const renderRideCard = (ride: any) => {
    const status = getRideStatus(ride);
    const isJoined = ride.participants?.some((p: any) => p.user_id === session?.user?.id);
    const isDriver = ride.driver_id === session?.user?.id;
    const isExpanded = expandedRideId === ride.id;
    const weather = weatherData[ride.id];

    const filling = isFillingFast(ride);
    const leaveHint = getBestTimeToLeave(ride);

    return (
      <div
        key={ride.id}
        className={`border rounded-[2.5rem] relative overflow-hidden transition-all duration-500 cursor-pointer press-effect
          ${isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200 shadow-sm'}
          ${isExpanded ? (isDark ? 'border-blue-500/40' : 'border-blue-400/50') : ''}
          ${status === 'past' ? 'opacity-60' : ''}
        `}
        onClick={() => setExpandedRideId(isExpanded ? null : ride.id)}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'past' ? 'bg-slate-500/10 text-slate-500 border-slate-600' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {status === 'active' ? '● Active' : status}
              </div>
              {filling && (
                <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full">
                  🔥 Filling fast
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); window.open(getWhatsAppShareUrl(ride), '_blank'); }}
                className={`p-1.5 rounded-lg ${isDark ? 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-600'} transition-colors`}
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <div className={`p-1.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <h3 className={`font-black text-lg mb-1 leading-tight ${textMain}`}>{ride.title}</h3>
          <div className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide ${textSub}`}>
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">{ride.start_location?.split(',')[0]}</span>
            <span>➔</span>
            <span className="truncate">{ride.end_location?.split(',')[0]}</span>
          </div>
          {leaveHint && !isExpanded && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">⏱ {leaveHint}</span>
            </div>
          )}

          {!isExpanded && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${textSub}`}>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {ride.participants?.length || 0}/{ride.max_members}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>
                   {ride.distance}
                </div>
              </div>
              
              {isJoined || isDriver ? (
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Joined</span>
              ) : status === 'past' ? (
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Expired</span>
              ) : (
                 <button onClick={(e) => handleInitialJoinClick(ride, e)} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Join</button>
              )}
            </div>
          )}
        </div>

        {/* Expanded detail panel */}
        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
             <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[8px] font-black uppercase tracking-[0.15em] mb-1.5 ${textSub}`}>Schedule</div>
                  <div className={`text-[10px] font-black italic ${textMain}`}>{ride.ride_date} @ {ride.ride_time?.substring(0,5)}</div>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[8px] font-black uppercase tracking-[0.15em] mb-1.5 ${textSub}`}>Leader</div>
                  <div className={`text-[10px] font-black italic ${textMain}`}>{ride.driver?.full_name?.split(' ')[0] || 'Pilot'}</div>
                </div>
             </div>

             {/* Weather Outlook */}
             <div className={`rounded-[2rem] p-4 border ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
                <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                   <Thermometer className="w-3.5 h-3.5" /> Weather Outlook
                </div>
                {weather ? (
                  <div className="flex justify-between items-center text-center">
                    <div className="flex-1">
                       <div className={`text-[11px] font-black ${textMain}`}>{weather.start?.temp || '--'}</div>
                       <div className={`text-[8px] uppercase font-bold ${textSub}`}>Origin</div>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10 mx-2" />
                    <div className="flex-1">
                       <div className={`text-[11px] font-black ${textMain}`}>{weather.end?.temp || '--'}</div>
                       <div className={`text-[8px] uppercase font-bold ${textSub}`}>Dest</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[9px] font-bold animate-pulse text-slate-500 uppercase">Updating Atmospheric Data...</div>
                )}
             </div>

             {/* Action Button */}
             {isJoined || isDriver ? (
               <button onClick={(e) => { e.stopPropagation(); navigate('/rideroom'); }} className="w-full bg-emerald-600 text-white py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Radio className="w-4 h-4" /> Live Formation Room
               </button>
             ) : status === 'past' ? (
               <div className="w-full py-4 rounded-[1.5rem] bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 text-center uppercase tracking-widest">EXPEDITION EXPIRED</div>
             ) : (
               <button 
                 onClick={(e) => handleInitialJoinClick(ride, e)}
                 disabled={isJoiningLocal === ride.id}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
               >
                  {isJoiningLocal === ride.id ? 'Syncing...' : 'AUTHENTICATE & JOIN'}
               </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen pb-28 ${bg} transition-colors duration-300 relative`}>
      {isDark && <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />}

      {/* Header & Search */}
      <div className="relative pt-6 px-5 pb-3 z-20">
        <h1 className={`text-2xl font-black mb-1 tracking-tight ${textMain}`}>Network</h1>
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-5 ${textSub}`}>Explore & secure formation slots</p>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search destination, route, pilots..."
            className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${inputBg}`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 pt-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-28 animate-pulse rounded-[2.5rem] ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
          ))}
        </div>
      ) : (
        <div className="relative z-10 px-5 pt-8 space-y-8">
          
          {/* My Formations */}
          {myRides.length > 0 && !debouncedSearch && (
            <div>
              <h2 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textSub}`}>
                <Calendar className="w-4 h-4" /> My Roster
              </h2>
              <div className="space-y-4">
                {myRides.map(ride => renderRideCard(ride))}
              </div>
            </div>
          )}

          {/* Discoverable Rides */}
          <div>
            <h2 className={`text-xl font-black mb-5 tracking-tight flex items-center gap-2 ${textMain}`}>
              <Search className="w-5 h-5 text-blue-500" /> Discover Rides
            </h2>

            {filteredDiscover.length === 0 ? (
              <div className={`border rounded-[2rem] p-8 text-center ${isDark ? 'bg-black/30 border-white/5' : 'bg-white border-slate-200'}`}>
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No active formation vectors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiscover.map(ride => renderRideCard(ride))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPasscodeModal(false)} />
          <div className={`relative w-full max-w-sm rounded-[2.5rem] border shadow-2xl p-8 animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#121624] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="text-center mb-6">
              <h3 className={`text-xl font-black mb-2 ${textMain}`}>Secure Protocol Key</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${textSub}`}>Auth required for {targetRideForPasscode?.title}</p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <input 
                autoFocus required type="text" placeholder="CODE" value={passcode}
                onChange={e => { setPasscode(e.target.value.toUpperCase()); setPasscodeError(false); }}
                className={`w-full bg-black/40 border-2 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.4em] outline-none transition-all placeholder:text-slate-800 ${passcodeError ? 'border-red-500' : 'border-white/5 focus:border-blue-500/50'}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowPasscodeModal(false)} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Abort</button>
                <button type="submit" className="py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
