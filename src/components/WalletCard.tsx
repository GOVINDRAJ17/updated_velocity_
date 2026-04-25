import { useState, useEffect } from 'react';
import { Wallet, Plus, ChevronRight, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchWalletBalance, fetchTransactions, addMoneyToWallet } from '../lib/wallet';

export function WalletCard() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWallet();
    
    // Real-time subscription for balance and transactions
    const balanceChannel = supabase.channel('wallet-sync')
      .on('postgres_changes', { event: 'UPDATE', table: 'profiles' }, () => loadWallet())
      .on('postgres_changes', { event: 'INSERT', table: 'transactions' }, () => loadWallet())
      .subscribe();

    return () => {
      supabase.removeChannel(balanceChannel);
    };
  }, []);

  const loadWallet = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const [bal, txs] = await Promise.all([
        fetchWalletBalance(session.user.id),
        fetchTransactions(session.user.id)
      ]);
      
      setBalance(Number(bal));
      setRecentTransactions(txs.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Simulate UPI deep link redirect
      const upiUrl = `upi://pay?pa=velocity@oksbi&pn=VelocityApp&am=${val}&cu=INR&tn=WalletTopup`;
      window.location.href = upiUrl;
      
      // For simulation, we'll just update after a delay (or user confirms)
      // In a real app, this would be handled by a webhook
      setTimeout(async () => {
        await addMoneyToWallet(session!.user.id, balance, val);
        setShowAddMoney(false);
        setAmount('');
        loadWallet();
      }, 2000);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && balance === 0) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-blue-500/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
         
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Wallet className="w-6 h-6 text-blue-400" />
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Available Balance</h3>
                  <div className="text-3xl font-black text-white italic tracking-tight">₹{balance.toLocaleString()}</div>
               </div>
            </div>
            <button 
              onClick={() => setShowAddMoney(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/40"
            >
               <Plus className="w-6 h-6 font-black" />
            </button>
         </div>

         {/* Mini History */}
         <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
            {recentTransactions.map((tx) => (
               <div key={tx.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                     {tx.type === 'wallet_credit' || tx.type === 'split_receive' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                     ) : (
                        <ArrowDownLeft className="w-3 h-3 text-rose-400" />
                     )}
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]">
                        {tx.description}
                     </span>
                  </div>
                  <span className={`text-[10px] font-black ${tx.type.includes('credit') || tx.type.includes('receive') ? 'text-emerald-400' : 'text-slate-300'}`}>
                     {tx.type.includes('credit') || tx.type.includes('receive') ? '+' : '-'}₹{tx.amount}
                  </span>
               </div>
            ))}
            {recentTransactions.length === 0 && (
               <p className="text-[9px] text-slate-600 font-bold uppercase text-center tracking-widest py-2">No activity recorded</p>
            )}
         </div>
      </div>

      {showAddMoney && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-[#121624] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Add Credits</h3>
              <div className="space-y-4">
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-500">₹</span>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Enter amount" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-6 py-4 outline-none focus:border-blue-500 text-xl font-black text-white" 
                    />
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map(val => (
                       <button 
                         key={val} 
                         onClick={() => setAmount(val.toString())}
                         className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-slate-400 hover:text-white"
                       >
                          +₹{val}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowAddMoney(false)}
                      className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={handleAddMoney}
                      className="flex-[2] py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                    >
                       Authorise UPI
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
