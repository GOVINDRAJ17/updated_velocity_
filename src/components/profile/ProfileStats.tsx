interface ProfileStatsProps {
  routesCount: number;
  groupsCount: number;
  distance: number;
  isDark: boolean;
}

export function ProfileStats({ routesCount, groupsCount, distance, isDark }: ProfileStatsProps) {
  return (
    <div className="px-5 mb-8 relative z-10 w-full mt-4">
      <div className={`flex items-center justify-between p-5 md:p-6 rounded-[2rem] border shadow-2xl relative overflow-hidden mx-auto ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'}`}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none"></div>}
        <div className="text-center flex-1 relative z-10">
          <div className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-br from-white to-slate-300' : 'bg-gradient-to-br from-slate-900 to-slate-600'}`}>{routesCount}</div>
          <div className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest mt-1.5">Routes</div>
        </div>
        <div className={`w-[1px] h-12 relative z-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        <div className="text-center flex-1 relative z-10">
          <div className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-br from-white to-slate-300' : 'bg-gradient-to-br from-slate-900 to-slate-600'}`}>{groupsCount}</div>
          <div className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest mt-1.5">Groups</div>
        </div>
        <div className={`w-[1px] h-12 relative z-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        <div className="text-center flex-1 relative z-10">
          <div className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-br from-white to-slate-300' : 'bg-gradient-to-br from-slate-900 to-slate-600'}`}>{distance}</div>
          <div className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest mt-1.5">KM Driven</div>
        </div>
      </div>
    </div>
  );
}
