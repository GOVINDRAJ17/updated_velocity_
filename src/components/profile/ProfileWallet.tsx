import { IndianRupee, Share2, ChevronRight } from 'lucide-react';

interface ProfileWalletProps {
  balance: number;
  isGuest: boolean;
  isDark: boolean;
  onShowWallet: () => void;
  onShowSplits: () => void;
}

export function ProfileWallet({ balance, isGuest, isDark, onShowWallet, onShowSplits }: ProfileWalletProps) {
  if (isGuest) return null;

  return (
    <div className="px-5 mb-10 relative z-10">
      <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] px-2 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Wallet & Payments
      </h3>
      
      <div className={`rounded-3xl border ${isDark ? 'bg-[#121624]/40 border-white/5' : 'bg-white border-slate-100'}`}>
        {/* Balance Item */}
        <div 
          onClick={onShowWallet}
          className="p-5 flex items-center justify-between group active:bg-blue-500/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
               <IndianRupee className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <div className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Personal Balance</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">₹{balance.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">Top Up</span>
             <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
        </div>

        <div className={`h-[1px] mx-5 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} />

        {/* Split Item */}
        <div 
          onClick={onShowSplits}
          className="p-5 flex items-center justify-between group active:bg-indigo-500/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
               <Share2 className="w-5 h-5 text-indigo-500 rotate-90" />
            </div>
            <div>
               <div className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ride Splits</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Manage Group Expenses</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </div>
  );
}
