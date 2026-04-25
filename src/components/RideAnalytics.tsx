import { useState, useEffect } from 'react';
import {
  X, ArrowLeft, Navigation, Clock, Zap, TrendingUp,
  MapPin, Users, Calendar, Award, Gauge, CheckCircle2,
  Timer, Target, Share2, BarChart3
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getRouteEfficiencyScore, getTimeSavingInsight } from '../lib/insights';

interface RideAnalyticsProps {
  ride: any;
  onClose: () => void;
}

/** Pure SVG arc speedometer */
function Speedometer({ value, max = 120, label }: { value: number; max?: number; label: string }) {
  const pct = Math.min(1, value / max);
  const radius = 52;
  const circumference = Math.PI * radius; // half circle arc
  const strokeDash = circumference * pct;
  const color = pct > 0.75 ? '#10b981' : pct > 0.45 ? '#3b82f6' : '#6366f1';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 70" className="w-36 h-24">
        {/* Track */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        {/* Center value */}
        <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="900" fill="white" fontFamily="system-ui">
          {value.toFixed(0)}
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,1)" fontFamily="system-ui" fontWeight="700" letterSpacing="2">
          KM/H
        </text>
      </svg>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-[11px] font-black text-white">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RideAnalytics({ ride, onClose }: RideAnalyticsProps) {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  const distanceKm = parseFloat(ride.distance?.replace(/[^0-9.]/g, '') || '0') || 0;
  const estTimeMins = distanceKm > 0 ? Math.round(distanceKm / 45 * 60) : 0;

  const rideStart = ride.start_datetime ? new Date(ride.start_datetime) : null;
  const rideEnd = ride.end_datetime ? new Date(ride.end_datetime) : null;
  const actualMins = rideStart && rideEnd ? Math.round((rideEnd.getTime() - rideStart.getTime()) / 60000) : null;

  const participantCount = ride.participants?.length || 0;
  const avgSpeed = distanceKm > 0 && estTimeMins > 0 ? Math.round((distanceKm / estTimeMins) * 60) : 0;
  const maxSpeed = Math.round(avgSpeed * 1.35);
  const minSpeed = Math.round(avgSpeed * 0.6);

  const efficiencyScore = getRouteEfficiencyScore(ride);
  const timeSavingInsight = getTimeSavingInsight(ride);

  let performanceLabel = '';
  let performanceColor = '';
  if (avgSpeed >= 55) { performanceLabel = 'Elite pace — above average formation speed'; performanceColor = 'text-emerald-400'; }
  else if (avgSpeed >= 40) { performanceLabel = 'On schedule — consistent formation rhythm'; performanceColor = 'text-blue-400'; }
  else if (avgSpeed > 0) { performanceLabel = 'Steady ground — reliable pacing maintained'; performanceColor = 'text-yellow-400'; }
  else { performanceLabel = 'No route data available yet'; performanceColor = 'text-slate-500'; }

  const cardBg = isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`fixed inset-0 z-[150] ${isDark ? 'bg-[#0B0F19]' : 'bg-slate-50'} flex flex-col overflow-hidden animate-fade-scale`}>
      {isDark && (
        <>
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-20 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className={`px-5 pt-6 pb-4 flex items-center gap-4 border-b ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white/80'} backdrop-blur-md relative z-10 flex-shrink-0`}>
        <button onClick={onClose} className={`p-2.5 rounded-full press-effect transition-all ${isDark ? 'bg-white/5 border border-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
          <ArrowLeft className={`w-5 h-5 ${textMain}`} />
        </button>
        <div>
          <h2 className={`text-lg font-black tracking-tight line-clamp-1 ${textMain}`}>{ride.title}</h2>
          <p className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>Ride Analytics</p>
        </div>
        <div className="ml-auto">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200'}`}>
            {ride.ride_date}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar space-y-5 relative z-10">

        {/* Route Card */}
        <div className={`${isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-blue-500/20' : 'bg-white border-blue-200 shadow-md'} border rounded-[2.5rem] p-6 relative overflow-hidden animate-slide-up`}>
          <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${textSub}`}>
            <div className="h-1.5 w-5 bg-blue-500 rounded-full" /> Route Summary
          </div>
          <div className={`flex items-center gap-3 text-sm ${textMain}`}>
            <div className="flex-1 min-w-0">
              <div className={`text-[9px] font-black uppercase mb-0.5 ${textSub}`}>From</div>
              <div className="font-black truncate">{ride.start_location?.split(',')[0] || 'Unknown'}</div>
            </div>
            <Navigation className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <div className={`text-[9px] font-black uppercase mb-0.5 ${textSub}`}>To</div>
              <div className="font-black truncate">{ride.end_location?.split(',')[0] || 'Unknown'}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up stagger-1">
          {[
            { icon: <Navigation className="w-5 h-5 text-blue-400" />, label: 'Distance', value: distanceKm > 0 ? `${distanceKm} km` : 'N/A' },
            { icon: <Clock className="w-5 h-5 text-indigo-400" />, label: 'Duration', value: actualMins ? `${actualMins}m` : estTimeMins > 0 ? `~${estTimeMins}m` : 'N/A' },
            { icon: <Users className="w-5 h-5 text-emerald-400" />, label: 'Squad', value: `${participantCount + 1}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className={`border rounded-[2rem] p-4 text-center ${cardBg}`}>
              <div className="flex justify-center mb-2">{icon}</div>
              <div className={`text-lg font-black italic ${textMain}`}>{value}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${textSub}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* SVG Speedometer */}
        {avgSpeed > 0 && (
          <div className={`border rounded-[2.5rem] p-6 animate-slide-up stagger-2 ${cardBg}`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ${textSub}`}>
              <Gauge className="w-4 h-4 text-blue-400" /> Speed Profile
            </div>
            <div className="flex justify-around items-center mb-6 gap-2">
              <Speedometer value={minSpeed} label="Min Speed" />
              <div className="flex flex-col items-center">
                <div className={`text-3xl font-black ${textMain}`}>{avgSpeed}</div>
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Avg km/h</div>
              </div>
              <Speedometer value={maxSpeed} label="Peak Speed" />
            </div>
            <div className="space-y-3">
              <StatBar label="Average Speed" value={avgSpeed} max={120} color="bg-blue-500" />
              <StatBar label="Peak Speed (est.)" value={maxSpeed} max={120} color="bg-indigo-500" />
              <StatBar label="Min Speed (est.)" value={minSpeed} max={120} color="bg-slate-500" />
            </div>
          </div>
        )}

        {/* Route Efficiency */}
        <div className={`border rounded-[2.5rem] p-6 animate-slide-up stagger-3 ${cardBg}`}>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ${textSub}`}>
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Route Efficiency
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className={`text-5xl font-black italic ${textMain}`}>{efficiencyScore}<span className="text-xl text-slate-500 not-italic">%</span></div>
            <div>
              <div className={`text-xs font-black mb-1 ${efficiencyScore >= 80 ? 'text-emerald-400' : efficiencyScore >= 50 ? 'text-blue-400' : 'text-yellow-400'}`}>
                {efficiencyScore >= 80 ? 'Excellent' : efficiencyScore >= 50 ? 'Good' : 'Moderate'}
              </div>
              <div className={`text-[10px] leading-snug ${textSub}`}>Route efficiency score based on distance vs. time</div>
            </div>
          </div>
          <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-1000"
              style={{ width: `${animIn ? efficiencyScore : 0}%` }}
            />
          </div>
        </div>

        {/* Personalized Insight */}
        <div className={`border rounded-[2.5rem] p-6 animate-slide-up stagger-4 ${isDark ? 'bg-gradient-to-br from-[#1A1F2E] to-[#0B0F19] border-white/5' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm'}`}>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${textSub}`}>
            <TrendingUp className="w-4 h-4 text-emerald-400" /> AI Insight
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <p className={`text-sm font-bold leading-relaxed ${performanceColor}`}>{performanceLabel}</p>
          </div>
          {timeSavingInsight && (
            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-200'} text-[11px] font-bold ${textSub}`}>
              💡 {timeSavingInsight}
            </div>
          )}
        </div>

        {/* Ride Details */}
        <div className={`border rounded-[2.5rem] p-6 ${cardBg}`}>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${textSub}`}>Ride Details</div>
          <div className="space-y-3">
            {[
              { label: 'Scheduled Date', value: ride.ride_date || 'N/A' },
              { label: 'Departure Time', value: ride.ride_time?.substring(0, 5) || 'N/A' },
              { label: 'Max Capacity', value: `${ride.max_members || '—'} riders` },
              { label: 'Status', value: ride.status || 'Scheduled' },
              ...(ride.access_code ? [{ label: 'Access Code', value: ride.access_code }] : []),
            ].map(({ label, value }) => (
              <div key={label} className={`flex items-center justify-between py-2.5 border-b last:border-b-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className={`text-[11px] font-black uppercase tracking-widest ${textSub}`}>{label}</span>
                <span className={`text-[11px] font-black capitalize font-mono ${textMain}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
