import { CheckCircle, Share2, Bike, Car } from 'lucide-react';

interface ProfileOverviewProps {
  profile: any;
  session: any;
  isDark: boolean;
  onEdit: () => void;
  onShare: () => void;
}

export function ProfileOverview({ profile, session, isDark, onEdit, onShare }: ProfileOverviewProps) {
  return (
    <div className="px-5 mb-10 relative z-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <img 
            src={profile.avatar_url || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop"} 
            alt="Profile" 
            className={`w-24 h-24 rounded-full object-cover shadow-2xl relative z-10 border-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`} 
          />
          {session?.user && (
            <div className="absolute bottom-0 right-1 bg-blue-600 p-1 rounded-full border-2 border-[#0B0F19] z-20 shadow-lg">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="max-w-xs">
          <h2 className="text-2xl font-black leading-tight tracking-tight mb-1">{profile.full_name}</h2>
          {profile.bio ? (
            <p className="text-[13px] font-medium text-slate-400 leading-relaxed mb-4 px-2">{profile.bio}</p>
          ) : (
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-4 italic">No bio drafted</p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              {profile.experience_level || 'Beginner'}
            </span>
            {(profile.bike_model || profile.vehicle_type) && (
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-colors flex items-center gap-1.5 ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                {profile.vehicle_type === 'Car' ? <Car className="w-3 h-3"/> : <Bike className="w-3 h-3"/> }
                {profile.bike_model || profile.vehicle_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 w-full max-w-[280px] mx-auto">
        <button 
          onClick={onEdit} 
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 border ${isDark ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900'}`}
        >
          Edit Profile
        </button>
        <button 
          onClick={onShare} 
          className={`p-3 rounded-2xl transition-all active:scale-95 border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
