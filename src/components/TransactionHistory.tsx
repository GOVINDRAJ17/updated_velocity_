import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchTransactions, Transaction } from '../lib/wallet';
import { ArrowUpRight, ArrowDownLeft, Wallet, IndianRupee, PieChart, CheckCircle2 } from 'lucide-react';

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const data = await fetchTransactions(session.user.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'wallet_credit': return <div className="p-2 bg-emerald-500/10 rounded-xl"><Wallet className="w-4 h-4 text-emerald-400" /></div>;
      case 'wallet_debit': return <div className="p-2 bg-rose-500/10 rounded-xl"><Wallet className="w-4 h-4 text-rose-400" /></div>;
      case 'split_pay': return <div className="p-2 bg-blue-500/10 rounded-xl"><PieChart className="w-4 h-4 text-blue-400" /></div>;
      case 'split_receive': return <div className="p-2 bg-emerald-500/10 rounded-xl"><IndianRupee className="w-4 h-4 text-emerald-400" /></div>;
      default: return <div className="p-2 bg-slate-500/10 rounded-xl"><CheckCircle2 className="w-4 h-4 text-slate-400" /></div>;
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
       {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl w-full" />)}
    </div>
  );

  if (transactions.length === 0) return (
    <div className="py-12 text-center">
       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
          <Clock className="w-8 h-8 text-slate-700" />
       </div>
       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No transaction history found</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all">
          <div className="flex items-center gap-4">
             {getIcon(tx.type)}
             <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-none mb-1">{tx.description}</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                   {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
             </div>
          </div>
          <div className="text-right">
             <div className={`text-sm font-black italic ${tx.type.includes('credit') || tx.type.includes('receive') ? 'text-emerald-400' : 'text-slate-300'}`}>
                {tx.type.includes('credit') || tx.type.includes('receive') ? '+' : '-'}₹{tx.amount}
             </div>
             <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Settled</div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { Clock } from 'lucide-react';
