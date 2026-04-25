import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { updatePaymentStatus } from '../lib/payments';
import { QrCode, CreditCard, ChevronRight, Check } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  splitMemberId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripePaymentForm({ amount, splitMemberId, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('card');
  const [upiPaid, setUpiPaid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL for redirection (if needed, but usually handled here)
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        await updatePaymentStatus(splitMemberId, 'paid');
        onSuccess();
      } catch (err: any) {
        setMessage("Payment succeeded but status update failed: " + err.message);
      }
      setIsLoading(false);
    } else {
      setMessage("Payment status: " + paymentIntent?.status);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#121624] p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-black text-white mb-6 tracking-tight">Complete Payment</h3>
      
      {/* Payment Method Switcher */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 shadow-inner">
         <button 
           onClick={() => setPayMethod('card')}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${payMethod === 'card' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <CreditCard className="w-4 h-4" /> Card
         </button>
         <button 
           onClick={() => setPayMethod('upi')}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${payMethod === 'upi' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <QrCode className="w-4 h-4" /> UPI / QR
         </button>
      </div>

      <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner relative overflow-hidden group">
        <div className="absolute -right-5 -top-5 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Settlement Amount</div>
        <div className="text-3xl font-black text-white">₹{amount.toFixed(2)}</div>
      </div>
      
      {payMethod === 'card' ? (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
          
          {message && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={isLoading || !stripe || !elements}
              id="submit"
              className="flex-2 bg-white text-slate-900 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? "Processing..." : "Secure Pay"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 relative group">
                 <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=velocity@oksbi&pn=VelocityApp&am=${amount}&cu=INR&tn=RideSplit&size=200x200`} 
                   alt="UPI QR Code"
                   className="relative w-48 h-48"
                 />
              </div>
              <div className="text-center">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Official UPI ID</div>
                 <div className="flex items-center gap-2 p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-sm font-black text-blue-400">velocity@oksbi</span>
                    <Check className="w-3 h-3 text-slate-600" />
                 </div>
              </div>
           </div>

           <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed text-center tracking-tight">
                Scan the QR code with any UPI app (GPay, PhonePe, Paytm) to settle your share instantly.
              </p>
           </div>

           <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10"
              >
                Back
              </button>
              <button
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await updatePaymentStatus(splitMemberId, 'paid');
                    onSuccess();
                  } catch (err: any) {
                    setMessage("Failed to update status: " + err.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : "I've Paid Successfully"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
