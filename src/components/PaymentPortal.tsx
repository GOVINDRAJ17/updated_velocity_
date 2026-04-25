import { useState, useEffect } from 'react';
import { 
  X, Wallet, QrCode, CreditCard, ChevronRight, 
  CheckCircle2, Clock, AlertCircle, Check, ArrowRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchWalletBalance, payFromWallet, recordTransaction } from '../lib/wallet';
import { updatePaymentStatus } from '../lib/payments';

interface PaymentPortalProps {
  amount: number;
  splitMemberId: string;
  splitId: string;
  splitTitle: string;
  creatorUpi: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentPortal({ 
  amount, splitMemberId, splitId, splitTitle, creatorUpi, onSuccess, onCancel 
}: PaymentPortalProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState<'wallet' | 'upi'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const bal = await fetchWalletBalance(session.user.id);
      setBalance(Number(bal));
      if (bal < amount) {
        setPayMethod('upi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletPay = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Deduct from wallet & record transaction
      await payFromWallet(session.user.id, balance, amount, splitId, splitTitle);
      
      // 2. Update split member status
      await updatePaymentStatus(splitMemberId, 'paid');
      
      // 3. (Optional but good) Record split_receive for the creator
      // We skip this for now as we don't handle cross-user wallet credits in this phase
      // unless we want to simulate the whole platform economy.
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExternalUpi = async () => {
    // Generate UPI deep link to creator with mode=02 (suggest non-editable amount)
    const upiUrl = `upi://pay?pa=${creatorUpi}&pn=VelocityEntry&am=${amount}&cu=INR&tn=Split_${splitTitle.substring(0,10)}&mode=02`;
    window.location.href = upiUrl;
    
    // Show confirmation button
    setPayMethod('upi');
  };

  const confirmExternalPay = async () => {
    try {
      setIsProcessing(true);
      await updatePaymentStatus(splitMemberId, 'paid');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-[#121624] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
       <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
             <h3 className="text-xl font-black text-white tracking-tight uppercase px-1">Check-Out</h3>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Ref: {splitId.substring(0,8)}</p>
          </div>
          <button onClick={onCancel} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 border border-white/5 transition-all">
             <X className="w-5 h-5 text-slate-400" />
          </button>
       </div>

       <div className="p-8 space-y-8">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-[2rem] border border-blue-500/20 relative overflow-hidden group">
             <div className="absolute -right-5 -top-5 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                <div className="h-1 w-4 bg-blue-500/40" /> Settlement Value
             </div>
             <div className="text-4xl font-black text-white italic tracking-tighter antialiased">₹{amount.toFixed(2)}</div>
             <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{splitTitle}</div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
             <button 
               onClick={() => setPayMethod('wallet')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${payMethod === 'wallet' ? 'bg-white text-slate-900 shadow-xl scale-100' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Wallet className="w-4 h-4" /> Velocity Cash
             </button>
             <button 
               onClick={() => setPayMethod('upi')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${payMethod === 'upi' ? 'bg-white text-slate-900 shadow-xl scale-100' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <QrCode className="w-4 h-4" /> Direct UPI
             </button>
          </div>

          {payMethod === 'wallet' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cash Balance</div>
                    <div className="text-xl font-black text-white italic">₹{balance.toLocaleString()}</div>
                  </div>
                  {balance < amount ? (
                    <div className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">LOW FUNDS</div>
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  )}
               </div>

               {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">{error}</div>}

               {balance >= amount ? (
                  <button 
                    disabled={isProcessing}
                    onClick={handleWalletPay}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                     {isProcessing ? 'Verifying Transaction...' : <>Authorise Velocity Cash <ArrowRight className="w-4 h-4" /></>}
                  </button>
               ) : (
                  <button 
                    onClick={() => setPayMethod('upi')}
                    className="w-full py-5 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                  >
                     Use External UPI fallback
                  </button>
               )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex flex-col items-center">
                  <div className="bg-white p-5 rounded-3xl shadow-2xl mb-4 relative group">
                     <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl transition-all"></div>
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`upi://pay?pa=${creatorUpi}&pn=VelocityApp&am=${amount}&cu=INR&tn=SplitPay&mode=02`)}&size=200x200`} 
                       alt="Creator UPI QR"
                       className="relative w-40 h-40"
                     />
                  </div>
                  <div className="text-center">
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Receiving UPI ID</div>
                     <div className="flex items-center gap-2 p-3 bg-black/40 rounded-2xl border border-white/5">
                        <span className="text-xs font-black text-blue-400">{creatorUpi}</span>
                        <Check className="w-3 h-3 text-emerald-400" />
                     </div>
                  </div>
               </div>

               <p className="text-[9px] text-slate-500 font-bold uppercase text-center leading-relaxed px-4 tracking-tighter mb-4">
                  Scan the QR with another device, or tap below to open GPay/PhonePe directly on this phone.
               </p>

               <div className="space-y-3">
                 <button 
                   onClick={handleExternalUpi}
                   className="w-full py-5 bg-[#0B0F19] text-white border border-blue-500/30 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                    Pay via GPay / PhonePe <ArrowRight className="w-4 h-4" />
                 </button>

                 <button 
                   disabled={isProcessing}
                   onClick={confirmExternalPay}
                   className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                    {isProcessing ? 'Processing...' : 'I have Settled Digitally'}
                 </button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
