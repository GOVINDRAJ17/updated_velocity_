import { computeBadges } from '../../lib/insights';

interface ProfileAchievementsProps {
  authoredRidesCount: number;
  joinedRidesCount: number;
  phone?: string;
  isGuest: boolean;
  isDark: boolean;
}

export function ProfileAchievements({ authoredRidesCount, joinedRidesCount, phone, isGuest, isDark }: ProfileAchievementsProps) {
  if (isGuest) return null;
  
  const totalRides = authoredRidesCount + joinedRidesCount;
  const isVerified = !!phone;
  const badges = computeBadges(totalRides, isVerified);
  
  if (badges.length === 0) return null;

  return (
    <div className="px-5 mb-8 relative z-10">
      <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] px-2 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Achievements
      </h3>
      <div className="flex flex-wrap gap-2 px-1">
        {badges.map(badge => (
          <div key={badge.id} className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${badge.color}`}>
            <span>{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
