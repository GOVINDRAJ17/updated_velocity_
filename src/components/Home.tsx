import { 
  ArrowRight, Navigation, Zap, Award, Rocket, TrendingUp, Share2, MapPin, Activity, Flame, Users
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRides } from '../contexts/RideContext';
import { RideCardSkeleton } from './Skeleton';
import { CardStack } from './ui/card-stack';
import { getBestTimeToLeave, getTrafficLevel, getTrafficColor, getTrafficDot, isFillingFast } from '../lib/insights';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { allRides, isLoading, getRideStatus } = useRides();
  const traffic = getTrafficLevel();
  const isDark = theme !== 'light';

  // --- ECOSYSTEM ITEMS ---
  const ecosystemItems = [
    {
      id: 'find',
      title: "Find Riders",
      description: "Connect with vetted pilots in your sector. Squad riding, redefined.",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      imageSrc: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&sat=-100",
      gradient: "from-blue-500/10 to-transparent",
      action: () => navigate('/groups')
    },
    {
      id: 'plan',
      title: "Plan Rides",
      description: "Advanced route logistics and waypoint syncing for absolute safety.",
      icon: <Zap className="w-8 h-8 text-indigo-400" />,
      imageSrc: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&q=80&sat=-100",
      gradient: "from-indigo-500/10 to-transparent",
      action: () => navigate('/start')
    },
    {
      id: 'track',
      title: "Track Routes",
      description: "Real-time vector pathing and telemetry logging on every journey.",
      icon: <Navigation className="w-8 h-8 text-emerald-400" />,
      imageSrc: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80&sat=-100",
      gradient: "from-emerald-500/10 to-transparent",
      action: () => navigate('/maps')
    }
  ];

  // Helper for relative time
  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const minDiff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minDiff < 60) return `${Math.max(1, minDiff)}m ago`;
    const hrDiff = Math.floor(minDiff / 60);
    if (hrDiff < 24) return `${hrDiff}h ago`;
    return `${Math.floor(hrDiff / 24)}d ago`;
  };

  // --- STATS ---
  const totalRidesRecorded = allRides.length;
  const activePersonnel = allRides.reduce((acc, r) => acc + 1 + (r.participants?.length || 0), 0);
  const totalDistanceKm = allRides.reduce((acc, r) => {
    const d = parseFloat(r.distance?.replace(/[^0-9.]/g, '') || '0');
    return isNaN(d) ? acc : acc + d;
  }, 0);

  const incomingDispatches = allRides
    .filter(r => getRideStatus(r) !== 'past')
    .slice(0, 10);

  return (
    <div className={`pb-20 ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'} overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth relative mb-24`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      {/* A. HERO SECTION */}
      <section className="relative z-10 px-6 pt-12 pb-16 text-center animate-slide-up">
        {/* Live Status Bar */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Protocol V2.0</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getTrafficDot(traffic)}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${getTrafficColor(traffic)}`}>
              Traffic: {traffic}
            </span>
          </div>
        </div>
        
        <h1 className="text-6xl font-black tracking-tighter mb-4 leading-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
          Velocity
        </h1>
        <h2 className="text-xl font-bold tracking-tight text-white/90 mb-4 px-4">
          Ride Together. <span className="text-blue-500">Ride Smart.</span>
        </h2>
        <p className="text-sm font-medium text-slate-400 mb-10 max-w-[280px] mx-auto leading-relaxed">
          The premium landscape for real-world expeditions. Connect with vetted pilots and map every formation.
        </p>

        {/* Live Riders Count */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
          <div className="flex -space-x-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-[#0B0F19]" />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-300">
            <span className="text-white font-black">{activePersonnel}</span> riders active now
          </span>
        </div>
        
        <div className="flex flex-col gap-4 max-w-[320px] mx-auto">
          <button 
            onClick={() => navigate('/start')}
            className="press-effect w-full bg-white text-slate-900 rounded-2xl py-4 font-black text-xs tracking-widest uppercase shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
          >
             Start Formation <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/groups')}
            className="press-effect w-full bg-white/5 border border-white/10 rounded-2xl py-4 font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all text-slate-200"
          >
             Find Formation
          </button>
        </div>
      </section>

      {/* B. THE ECOSYSTEM (Card Stack) */}
      <section className="relative z-10 px-6 mb-16 animate-slide-up stagger-2">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className={`h-[1px] w-8 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div> The Ecosystem
        </h3>
        
        <div className="flex justify-center -mx-6">
          <CardStack 
            items={ecosystemItems}
            orientation="horizontal"
            cardWidth={window.innerWidth < 640 ? window.innerWidth - 48 : 520}
            cardHeight={320}
            autoAdvance
            intervalMs={3000}
            showDots
            renderCard={(item, { active }) => (
               <div 
                 onClick={() => item.action && item.action()}
                 className={`relative h-full w-full bg-[#121624] rounded-[2.5rem] border border-white/5 cursor-pointer transition-all duration-500 ${active ? 'scale-100 opacity-100' : 'scale-95 opacity-50'} overflow-hidden shadow-inner group press-effect`}
               >
                 <img 
                   src={item.imageSrc} 
                   className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:opacity-35 group-hover:scale-105 transition-all duration-700" 
                 />
                 <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50`} />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent" />
                 
                 <div className="relative z-10 h-full flex flex-col justify-end p-8">
                    <div className="mb-4 p-3 bg-white/5 rounded-2xl w-fit border border-white/10 backdrop-blur-md shadow-2xl">
                      {item.icon}
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{item.title}</h4>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">{item.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                 </div>
               </div>
            )}
          />
        </div>
      </section>

      {/* C. OUR MISSION */}
      <section className="relative z-10 px-6 mb-16 animate-slide-up stagger-3">
        <div className={`border p-8 rounded-[2.5rem] relative overflow-hidden group text-center ${isDark ? 'bg-gradient-to-br from-[#121624] to-[#0B0F19] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Mission Directive</h3>
          <p className={`text-lg font-bold leading-relaxed mb-4 max-w-[280px] mx-auto ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            Establishing the most advanced <span className={`italic ${isDark ? 'text-white' : 'text-slate-900'}`}>community network</span> for the modern rider.
          </p>
          <div className="flex justify-center gap-4 opacity-40">
            <div className="text-[9px] font-black uppercase tracking-widest">Safety First</div>
            <div className="text-[9px] font-black uppercase tracking-widest">•</div>
            <div className="text-[9px] font-black uppercase tracking-widest">Unified Comms</div>
          </div>
        </div>
      </section>

      {/* D. INCOMING DISPATCHES */}
      <section className="relative z-10 mb-16">
        <div className="px-6 flex items-center justify-between mb-6">
           <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
             <div className={`h-[1px] w-8 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div> Live Dispatches
           </h3>
           <button onClick={() => navigate('/groups')} className="text-[10px] font-black text-blue-400 flex items-center gap-1 uppercase tracking-widest press-effect">
             All Rides <ArrowRight className="w-3 h-3" />
           </button>
        </div>

        <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar snap-x snap-mandatory pb-6">
          {isLoading ? (
            [1, 2].map(i => (
              <div key={i} className="snap-center min-w-[310px]">
                <RideCardSkeleton />
              </div>
            ))
          ) : incomingDispatches.length === 0 ? (
             <div className={`w-full py-16 text-center mx-0 rounded-[2.5rem] border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-4xl mb-3">🛣️</div>
                <p className={`font-bold text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No formations detected yet.</p>
                <button onClick={() => navigate('/start')} className="mt-4 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/30 px-5 py-2 rounded-full">
                  Start one
                </button>
             </div>
          ) : (
            incomingDispatches.map((ride, idx) => {
              const status = getRideStatus(ride);
              const filling = isFillingFast(ride);
              const leaveHint = getBestTimeToLeave(ride);
              const statusColors = {
                active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                past: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
              };

              return (
                <div 
                  key={ride.id} 
                  className={`snap-center min-w-[310px] border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group press-effect cursor-pointer animate-slide-up ${isDark ? 'bg-gradient-to-br from-[#1A1F2E] to-[#0B0F19] border-white/10' : 'bg-white border-slate-200 shadow-md'}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => navigate('/maps')}
                >
                  {/* Glow */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                  
                  {/* Status row */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                     <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-1 rounded-full ${statusColors[status]}`}>
                          {status}
                        </span>
                        {filling && (
                          <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full uppercase tracking-widest">
                            🔥 Filling
                          </span>
                        )}
                     </div>
                     <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{getTimeAgo(ride.created_at)}</div>
                  </div>

                  <h4 className={`text-xl font-black mb-1 leading-tight pr-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{ride.title}</h4>
                  <div className={`text-[11px] font-bold flex items-center gap-1.5 mb-1 uppercase tracking-wider line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                     <MapPin className="w-3.5 h-3.5 text-blue-500" /> {ride.start_location?.split(',')[0]} ➔ {ride.end_location?.split(',')[0] || 'Destination'}
                  </div>
                  
                  {/* Insights row */}
                  {leaveHint && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{leaveHint}</span>
                    </div>
                  )}

                  {/* Bottom row */}
                  <div className={`flex items-center justify-between border px-4 py-3 rounded-2xl relative z-10 ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-7 h-7 rounded-full border-2 border-[#121624] bg-slate-800 shadow-lg" />
                         ))}
                         <div className="w-7 h-7 rounded-full border-2 border-[#121624] bg-blue-500 flex items-center justify-center text-[9px] font-black text-white shadow-lg">+{ride.participants?.length || 0}</div>
                       </div>
                       <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ride.distance}</span>
                     </div>
                     <button className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${isDark ? 'text-white bg-white/10 border-white/10' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                       View
                     </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* E. LIVE STATS SECTION */}
      <section className="relative z-10 px-6 mb-12 animate-slide-up stagger-4">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className={`h-[1px] w-8 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div> System Telemetry
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`border p-7 rounded-[2.5rem] shadow-xl text-center press-effect cursor-pointer ${isDark ? 'bg-[#121624]/60 backdrop-blur-md border-white/5' : 'bg-white border-slate-200 shadow-sm'}`} onClick={() => navigate('/start')}>
            <Award className="w-6 h-6 text-yellow-500 mx-auto mb-3" />
            <div className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalRidesRecorded}</div>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Formations</p>
          </div>
          
          <div className={`border p-7 rounded-[2.5rem] shadow-xl text-center press-effect cursor-pointer ${isDark ? 'bg-[#121624]/60 backdrop-blur-md border-white/5' : 'bg-white border-slate-200 shadow-sm'}`} onClick={() => navigate('/groups')}>
            <Activity className="w-6 h-6 text-blue-500 mx-auto mb-3" />
            <div className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{activePersonnel}</div>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Riders Active</p>
          </div>

          <div className={`col-span-2 border p-8 rounded-[2.5rem] shadow-xl flex items-center justify-around ${isDark ? 'bg-gradient-to-r from-[#121624] to-blue-900/20 border-white/5' : 'bg-gradient-to-r from-white to-blue-50 border-slate-200 shadow-sm'}`}>
            <div className="text-center">
              <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalDistanceKm.toFixed(0)}</div>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>KM Logged</p>
            </div>
            <div className={`h-10 w-[1px] ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>
            <div className="text-center">
              <div className={`text-4xl font-black tracking-tighter flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                100<span className="text-sm mt-1 text-blue-500">%</span>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 pt-12 pb-32 text-center">
        <div className={`h-[1px] w-12 mx-auto mb-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        <p className={`text-sm font-medium italic mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          "Ride safe. Stay connected. Velocity moves with you."
        </p>
        <div className={`text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mt-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          © Velocity Team. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
