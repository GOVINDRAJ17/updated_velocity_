import { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, AlertCircle, 
  ChevronRight, IndianRupee, Clock 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchUserBills, fetchRideSplits } from '../lib/payments';
import { PaymentPortal } from './PaymentPortal';
import { TransactionHistory } from './TransactionHistory';


export function MyBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<any | null>(null);
  const [owedAmount, setOwedAmount] = useState(0);

  useEffect(() => {
    loadBills();

    const channel = supabase
      .channel('my-bills-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', table: 'split_members' }, 
        () => loadBills()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBills = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const data = await fetchUserBills(session.user.id);
      setBills(data || []);

      // Calculate how much I am owed (from splits I created)
      const { data: mySplits, error: splitsError } = await supabase
        .from('splits')
        .select('*, split_members(*)')
        .eq('created_by', session.user.id);
      
      if (mySplits) {
        let totalOwed = 0;
        mySplits.forEach(split => {
          split.split_members.forEach((m: any) => {
            if (m.user_id !== session.user.id && m.payment_status === 'pending') {
              totalOwed += m.amount;
            }
          });
        });
        setOwedAmount(totalOwed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totals = bills.reduce((acc, b) => {
    if (b.payment_status === 'paid') acc.paid += b.amount;
    else acc.pending += b.amount;
    return acc;
  }, { paid: 0, pending: 0 });

  const handlePay = async (bill: any) => {
    try {
      // Find the creator's UPI ID for this split
      const { data: splits } = await supabase
        .from('splits')
        .select('*, profiles:created_by(upi_id)')
        .eq('id', bill.split_id)
        .single();
      
      if (!splits?.profiles?.upi_id) {
        throw new Error("Split creator hasn't linked a UPI ID yet. Please notify them.");
      }

      setActivePayment({ 
        bill, 
        creatorUpi: splits.profiles.upi_id,
        splitTitle: splits.title
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return null;
  
  // If no bills and not owed anything, show a clean "All settled" status
  if (bills.length === 0 && owedAmount === 0) {
    return (
      <section className="relative z-10 px-6 mb-16">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <div className="h-[1px] w-8 bg-slate-800"></div> My Ledger
        </h3>
        <div className="bg-[#121624]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 text-center shadow-xl">
           <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/10">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
           </div>
           <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">System Integrated</h4>
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">No pending accounts in your frequency</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 px-6 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="h-[1px] w-8 bg-slate-800"></div> My Ledger
        </h3>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${totals.pending > 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
          {totals.pending > 0 ? `₹${totals.pending.toFixed(0)} In Arrears` : 'Accounts Clear'}
        </span>
      </div>

      <div className="bg-gradient-to-br from-[#121624] to-[#0B0F19] border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
         
         {/* Summary Stats */}
         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Settled</div>
                <div className="text-xl font-black text-white">₹{totals.paid.toFixed(0)}</div>
            </div>
            <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
                <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">In Arrears</div>
                <div className="text-xl font-black text-blue-500">₹{totals.pending.toFixed(0)}</div>
            </div>
         </div>

         {owedAmount > 0 ? (
           <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between">
              <div>
                 <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Settlement Helper</div>
                 <div className="text-xl font-black text-white italic">You are owed ₹{owedAmount.toFixed(0)}</div>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                 <IndianRupee className="w-6 h-6 text-emerald-400" />
              </div>
           </div>
         ) : totals.pending > 0 ? (
            <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-between">
              <div>
                 <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Squad Ledger</div>
                 <div className="text-xl font-black text-white italic">You owe ₹{totals.pending.toFixed(0)}</div>
              </div>
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                 <IndianRupee className="w-6 h-6 text-rose-400" />
              </div>
           </div>
         ) : null}

         <div className="space-y-4">
            {bills.filter(b => b.payment_status === 'pending').slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                       <CreditCard className="w-5 h-5 text-slate-400 group-hover/item:text-blue-400 transition-colors" />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-white uppercase tracking-wider">{bill.split?.title}</h4>
                       <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {bill.split?.ride?.title || 'Unknown Ride'}
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm font-black text-white mb-2">₹{bill.amount.toFixed(2)}</div>
                    <button 
                      onClick={() => handlePay(bill)}
                      className="px-4 py-2 bg-white text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-1 active:scale-95 shadow-lg shadow-white/5"
                    >
                       Pay Now <ChevronRight className="w-3 h-3" />
                    </button>
                 </div>
              </div>
            ))}
            
            {bills.filter(b => b.payment_status === 'pending').length === 0 && (
              <div className="py-4 text-center">
                 <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest bg-emerald-500/5 py-3 rounded-2xl border border-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4" /> All accounts cleared
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Unified Payment Portal */}
      {activePayment && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 flex flex-col justify-center p-6 animate-in fade-in duration-300">
          <PaymentPortal 
            amount={activePayment.bill.amount}
            splitMemberId={activePayment.bill.id}
            splitId={activePayment.bill.split_id}
            splitTitle={activePayment.splitTitle}
            creatorUpi={activePayment.creatorUpi}
            onSuccess={() => {
              setActivePayment(null);
              loadBills();
            }}
            onCancel={() => setActivePayment(null)}
          />
        </div>
      )}

      {/* Transaction History Section */}
      <div className="mt-12 space-y-6">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="h-[1px] w-8 bg-slate-800"></div> System History
        </h3>
        <TransactionHistory />
      </div>
    </section>
  );
}
