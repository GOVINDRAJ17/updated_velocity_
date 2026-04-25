import { Shield } from 'lucide-react';

interface ProfileTrustProps {
  authoredRidesCount: number;
  joinedRidesCount: number;
  phone?: string;
  experienceLevel?: string;
  isGuest: boolean;
  isDark: boolean;
}

export function ProfileTrust({ authoredRidesCount, joinedRidesCount, phone, experienceLevel, isGuest, isDark }: ProfileTrustProps) {
  if (isGuest) return null;

  const trustItems = [
    { label: 'Rides Completed', value: `${authoredRidesCount + joinedRidesCount}`, verified: true, icon: '🏁' },
    { label: 'Phone Verified', value: phone ? 'Verified' : 'Not set', verified: !!phone, icon: '📱' },
    { label: 'Rider Level', value: experienceLevel || 'Beginner', verified: true, icon: '⚡' },
  ];

  return (
    <div className="px-5 mb-8 relative z-10">
      <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] px-2 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Trust & Verifications
      </h3>
      <div className={`rounded-2xl border divide-y ${isDark ? 'bg-white/3 border-white/5 divide-white/5' : 'bg-white border-slate-100 divide-slate-100'}`}>
        {trustItems.map(item => (
          <div key={item.label} className="flex items-center gap-3 p-4">
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1">
              <div className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</div>
              <div className={`text-[10px] uppercase font-black tracking-widest ${item.verified ? 'text-emerald-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.value}</div>
            </div>
            {item.verified && <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
