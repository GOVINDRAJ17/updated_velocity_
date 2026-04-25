import { Home as HomeIcon, MapPin, Play, User, Radio, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  visible?: boolean;
}

export function BottomNav({ visible = true }: BottomNavProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme !== 'light';

  const navItems = [
    { id: 'home', path: '/', icon: HomeIcon, label: 'Home' },
    { id: 'maps', path: '/maps', icon: MapPin, label: 'Map' },
    { id: 'start', path: '/start', icon: Play, label: 'Start', isCenter: true },
    { id: 'groups', path: '/groups', icon: Radio, label: 'Network' },
    { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className={`fixed bottom-6 left-0 right-0 z-50 px-5 flex justify-center pointer-events-none transition-all duration-500 ease-in-out transform ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0'
    }`}>
      <nav className={`pointer-events-auto flex items-center justify-between px-3 h-[70px] w-full max-w-[400px] rounded-[2.5rem] border transition-all duration-500 ${
        isDark
          ? 'bg-[#121624]/90 border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
          : 'bg-white/90 border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
      } backdrop-blur-2xl py-2`}>
        
        {navItems.map(({ id, path, icon: Icon, label, isCenter }) => {
          const isActive = location.pathname === path;

          if (isCenter) {
            return (
              <div key={id} className="flex-1 flex justify-center items-center">
                <button
                  onClick={() => navigate(path)}
                  className="relative flex items-center justify-center w-14 h-14 transition-all duration-300 group press-effect"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-blue-400 to-indigo-600 p-3.5 rounded-full border-2 border-slate-900 shadow-2xl group-active:scale-95 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-white fill-white ml-0.5" strokeWidth={0} />
                  </div>
                </button>
              </div>
            );
          }

          return (
            <div key={id} className="flex-1 flex flex-col justify-center items-center">
              <button
                onClick={() => navigate(path)}
                className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 rounded-2xl group press-effect ${
                  isActive
                    ? isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300 group-active:scale-90 ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            </div>
          );
        })}

      </nav>
    </div>
  );
}

