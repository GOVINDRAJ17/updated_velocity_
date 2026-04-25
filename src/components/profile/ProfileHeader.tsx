import { Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  username?: string;
  isDark: boolean;
}

export function ProfileHeader({ username, isDark }: ProfileHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="px-5 flex items-center justify-between mb-8 relative z-10 w-full">
      <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
        {username ? `@${username}` : 'Profile'}
      </h1>
      <button onClick={() => navigate('/settings')} className={`p-2.5 rounded-full transition-all active:scale-95 shadow-lg backdrop-blur-md border ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'}`}>
        <SettingsIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
