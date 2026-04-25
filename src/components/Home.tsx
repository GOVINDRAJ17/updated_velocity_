import { useState, useEffect } from 'react';
import { 
  ArrowRight, Activity, MapPin, Users, Zap, Map, Route, Navigation, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRides } from '../contexts/RideContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const { allRides, isLoading } = useRides();

  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [liveRoutesCount, setLiveRoutesCount] = useState(0);
  const [trendingRides, setTrendingRides] = useState<any[]>([]);

  useEffect(() => {
    // Process rides for counts
    if (allRides) {
      const activeRides = allRides.filter(r => r.status === 'active' || r.status === 'upcoming');
      setLiveRoutesCount(activeRides.length);
      
      // Calculate active users roughly from participants of active rides
      const usersInActiveRides = activeRides.reduce((acc, ride) => acc + (ride.participants?.length || 0) + 1, 0);
      setActiveUsersCount(usersInActiveRides);

      // Simple trending logic: rides with most participants, max 3
      const sorted = [...activeRides].sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0)).slice(0, 3);
      setTrendingRides(sorted);
    }
  }, [allRides]);

  // Set up real-time auto-refresh (Polling alternative: Supabase Realtime)
  useEffect(() => {
    const ridesChannel = supabase.channel('public:rides')
      .on('postgres_changes', { event: '*', table: 'rides' }, () => {
        // Handled by RideContext refresh normally, but we could trigger a local fetch if needed
        // For now, assume RideContext handles its own polling or realtime
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(ridesChannel);
    };
  }, []);

  return (
    <div className={`pb-20 ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'} min-h-screen overflow-y-auto no-scrollbar scroll-smooth relative`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 px-6 pt-16 pb-12 text-center animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
          Ride Together.<br/>Ride Smart.
        </h1>
        <p className="text-sm font-bold text-slate-400 max-w-[280px] mx-auto leading-relaxed mb-8">
          The ultimate platform for real-world expeditions. Connect with riders, form squads, and map your journey in real-time.
        </p>

        {/* PRIMARY ACTIONS */}
        <div className="flex flex-col gap-4 max-w-[320px] mx-auto">
          <button 
            onClick={() => navigate('/start')}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 press-effect hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
             Start a Ride <Zap className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/groups')}
            className={`w-full rounded-2xl py-4 font-black text-xs tracking-widest uppercase transition-all press-effect hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252C40]' : 'bg-white text-slate-900 border border-slate-200 shadow-sm'}`}
          >
             Explore Rides
          </button>
        </div>
      </section>

      {/* 2. LIVE DATA SECTION */}
      <section className="relative z-10 px-6 mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-5 rounded-[2rem] text-center shadow-lg border relative overflow-hidden group ${isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-700/20 rounded-full mb-3" />
                <div className="w-16 h-8 bg-slate-700/20 rounded-md mb-2" />
                <div className="w-20 h-3 bg-slate-700/20 rounded-md" />
              </div>
            ) : (
              <div className="relative z-10">
                <Users className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1">{activeUsersCount}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Riders Active
                </div>
              </div>
            )}
          </div>

          <div className={`p-5 rounded-[2rem] text-center shadow-lg border relative overflow-hidden group ${isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-700/20 rounded-full mb-3" />
                <div className="w-16 h-8 bg-slate-700/20 rounded-md mb-2" />
                <div className="w-20 h-3 bg-slate-700/20 rounded-md" />
              </div>
            ) : (
              <div className="relative z-10">
                <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-black mb-1">{liveRoutesCount}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Live Routes
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. WHAT USERS CAN DO */}
      <section className="relative z-10 px-6 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Capabilities
        </h3>
        <div className="flex flex-col gap-3">
          <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-[#1A1F2E] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-black mb-0.5">Join Rides</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Connect with nearby squads</p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-[#1A1F2E] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Route className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="text-sm font-black mb-0.5">Plan Routes</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Map your next expedition</p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-[#1A1F2E] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-sm font-black mb-0.5">Ride Live</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Share telemetry and location</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="relative z-10 px-6 mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-6 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          How It Works
        </h3>
        <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-6">
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border-[3px] border-[#0B0F19]"></div>
            <h4 className="text-sm font-black">Step 1: Setup Profile</h4>
            <p className="text-xs font-bold text-slate-400 mt-1">Verify your identity and bike details.</p>
          </div>
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border-[3px] border-[#0B0F19]"></div>
            <h4 className="text-sm font-black">Step 2: Find or Create</h4>
            <p className="text-xs font-bold text-slate-400 mt-1">Join an active formation or start your own.</p>
          </div>
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border-[3px] border-[#0B0F19]"></div>
            <h4 className="text-sm font-black">Step 3: Ride & Connect</h4>
            <p className="text-xs font-bold text-slate-400 mt-1">Use the Live Room for chat and tracking.</p>
          </div>
        </div>
      </section>

      {/* 5. FEATURE / DISCOVERY SECTION */}
      <section className="relative z-10 mb-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="px-6 flex items-center justify-between mb-4">
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Trending Routes
          </h3>
          <button onClick={() => navigate('/groups')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
            See All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto px-6 pb-6 snap-x snap-mandatory no-scrollbar">
          {isLoading ? (
            [1, 2].map((i) => (
              <div key={i} className={`snap-center min-w-[280px] p-5 rounded-[2rem] border animate-pulse ${isDark ? 'bg-[#1A1F2E] border-white/5' : 'bg-white border-slate-200'}`}>
                <div className="w-1/2 h-4 bg-slate-700/20 rounded mb-4" />
                <div className="w-3/4 h-6 bg-slate-700/20 rounded mb-2" />
                <div className="w-1/3 h-3 bg-slate-700/20 rounded mb-5" />
                <div className="w-full h-10 bg-slate-700/20 rounded-xl" />
              </div>
            ))
          ) : trendingRides.length === 0 ? (
            <div className={`w-full p-8 text-center rounded-[2rem] border ${isDark ? 'bg-[#1A1F2E] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">No trending rides currently.</p>
            </div>
          ) : (
            trendingRides.map((ride) => (
              <div 
                key={ride.id} 
                className={`snap-center min-w-[280px] p-5 rounded-[2rem] border group hover:-translate-y-1 transition-all duration-300 relative ${isDark ? 'bg-[#1A1F2E] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-md'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {ride.participants?.length || 0} Riders</span>
                </div>
                
                <h4 className="text-lg font-black mb-1 line-clamp-1">{ride.title}</h4>
                <p className="text-xs font-bold text-slate-400 mb-5 flex items-center gap-1"><MapPin className="w-3 h-3"/> {ride.start_location?.split(',')[0]} ➔ {ride.end_location?.split(',')[0]}</p>
                
                <button 
                  onClick={() => navigate('/groups')}
                  className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all press-effect ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 pt-8 pb-8 text-center opacity-40">
        <div className={`h-[1px] w-12 mx-auto mb-6 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`}></div>
        <p className="text-sm font-medium italic mb-2 text-slate-400">
          "Ride safe. Stay connected."
        </p>
        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mt-4">
          © Velocity Team. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
