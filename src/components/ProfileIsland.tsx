import { useTheme } from '../contexts/ThemeContext';

interface ProfileIslandProps {
  level: number;
  levelName: string;
  progress: number;
}

export function ProfileIsland({ level, levelName, progress }: ProfileIslandProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center gap-2 rounded-full px-2.5 py-1 ${
      theme === 'light' 
        ? 'bg-white shadow-sm' 
        : 'bg-slate-900'
    }`}>
      {/* Profile Image */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=32&h=32&fit=crop"
          alt="Profile"
          className="w-7 h-7 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-slate-900">
          <span className="text-[8px] font-bold text-white">{level}</span>
        </div>
      </div>
      
      {/* Level Info */}
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold text-blue-500">{levelName}</span>
        <div className={`w-12 h-1 rounded-full overflow-hidden ${
          theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
