import { useState, useEffect } from 'react';
import { 
  X, Plus, ArrowRight, ArrowUpRight, ArrowDownLeft, 
  Copy, Check, Wallet, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchWalletBalance, fetchTransactions, addMoneyToWallet } from '../lib/wallet';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

interface WalletViewProps {
  onClose: () => void;
}

export function WalletView({ onClose }: WalletViewProps) {
  const { toast, success, error } = useToast();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [bal, txs] = await Promise.all([
        fetchWalletBalance(session.user.id),
        fetchTransactions(session.user.id)
      ]);
      setBalance(Number(bal));
      setTransactions(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { error('Enter a valid amount'); return; }
    setIsAdding(true);
    
    // Always trigger redirect so user experiences the UPI intent flow (even on desktop it will try)
    const upiUrl = `upi://pay?pa=velocity@oksbi&pn=VelocityApp&am=${val}&cu=INR&tn=WalletTopup&mode=02`;
    window.location.href = upiUrl;

    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await addMoneyToWallet(session!.user.id, balance, val);
        setShowAddMoney(false);
        setAmount('');
        await loadData();
        success(`₹${val.toLocaleString()} added successfully!`);
      } catch {
        error('Payment failed. Please try again.');
      } finally {
        setIsAdding(false);
      }
    }, 2500);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText('velocity@oksbi');
    setCopied(true);
    toast('UPI ID copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const txIcon = (type: string) => {
    if (type === 'credit' || type === 'topup') return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
    return <ArrowUpRight className="w-4 h-4 text-red-400" />;
  };

  const txColor = (type: string) => (type === 'credit' || type === 'topup') ? 'text-emerald-400' : 'text-red-400';
  const txPrefix = (type: string) => (type === 'credit' || type === 'topup') ? '+' : '-';

  return (
    <div className={`fixed inset-0 z-[110] ${isDark ? 'bg-[#0B0F19]' : 'bg-slate-50'} text-${isDark ? 'white' : 'slate-900'} flex flex-col animate-slide-up`}>
      
      {/* Header */}
      <div className={`px-6 pt-8 pb-6 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white/90'} backdrop-blur-md`}>
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Wallet</h2>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Balance & Transactions</p>
        </div>
        <button onClick={onClose} className={`p-3 rounded-full border press-effect transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-100 border-slate-200'}`}>
          <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Balance Hero — Uber-Style */}
        <div className="px-6 pt-8 pb-6">
          <div className={`rounded-[2.5rem] p-8 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0D1117] border border-blue-500/15' : 'bg-white border border-slate-200 shadow-lg'}`}>
            {isDark && <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />}
            
            <div className="relative z-10">
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Wallet className="w-3 h-3" /> Available Balance
              </div>
              
              {loading ? (
                <div className="h-14 w-36 skeleton rounded-xl mb-6" />
              ) : (
                <div className={`text-6xl font-black tracking-tighter mb-6 flex items-start gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="text-2xl text-blue-500 mt-2 font-black">₹</span>
                  {balance.toLocaleString()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowAddMoney(true)}
                  className="press-effect bg-white text-slate-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                >
                  <Plus className="w-4 h-4" /> Top Up
                </button>
                <button className={`press-effect py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 mb-6 grid grid-cols-2 gap-3">
          {[
            { label: 'Total Spent', value: `₹${transactions.filter(t => t.type === 'debit').reduce((a, t) => a + (t.amount || 0), 0).toLocaleString()}`, icon: '💳', color: 'text-red-400' },
            { label: 'Total Added', value: `₹${transactions.filter(t => t.type !== 'debit').reduce((a, t) => a + (t.amount || 0), 0).toLocaleString()}`, icon: '🏦', color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-4 border ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Transaction Timeline */}
        <div className="px-6 pb-12">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <div className={`h-[1px] w-8 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} /> Transaction History
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💸</div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No transactions yet</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Your activity will appear here</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className={`absolute left-5 top-0 bottom-0 w-[1px] ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
              
              <div className="space-y-1">
                {transactions.map((tx, i) => (
                  <div key={tx.id || i} className={`relative flex items-center gap-4 py-3.5 pl-12 pr-4 rounded-2xl transition-colors ${isDark ? 'hover:bg-white/3' : 'hover:bg-slate-50'}`}>
                    {/* Timeline dot */}
                    <div className={`absolute left-[14px] w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      tx.type === 'credit' || tx.type === 'topup'
                        ? 'bg-emerald-400/20 border-emerald-400'
                        : 'bg-red-400/20 border-red-400'
                    }`} />
                    
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'credit' || tx.type === 'topup' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                      {txIcon(tx.type)}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {tx.description || (tx.type === 'topup' ? 'Wallet Top Up' : tx.type === 'credit' ? 'Payment Received' : 'Payment Sent')}
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : 'Recent'}
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className={`text-[13px] font-black flex-shrink-0 ${txColor(tx.type)}`}>
                      {txPrefix(tx.type)}₹{(tx.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-t-[2.5rem] border-t border-x p-8 pb-12 animate-slide-up ${isDark ? 'bg-[#121624] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Up Credits</h3>
              <button onClick={() => setShowAddMoney(false)} className={`p-2 rounded-full ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className={`w-full border-2 rounded-2xl pl-12 pr-5 py-5 outline-none text-3xl font-black transition-all ${isDark
                      ? 'bg-black/40 border-white/5 focus:border-blue-500/50 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-400 text-slate-900'}`}
                  />
                </div>
                {/* Quick amount chips */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[500, 1000, 2000].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val.toString())}
                      className={`press-effect py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        amount === val.toString()
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR / UPI section */}
              {!isMobile && (
                <div className={`rounded-2xl p-5 text-center border ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Scan with GPay / PhonePe</p>
                  <div className="bg-white p-3 rounded-xl w-fit mx-auto mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`upi://pay?pa=velocity@oksbi&pn=VelocityApp&am=${amount || 100}&cu=INR`)}&size=160x160`}
                      alt="QR"
                      className="w-28 h-28"
                    />
                  </div>
                  <button onClick={copyUpi} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mx-auto border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy UPI ID: velocity@oksbi'}
                  </button>
                </div>
              )}

              <button 
                onClick={handleAddMoney}
                disabled={isAdding || !amount}
                className={`press-effect w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                  isAdding ? 'opacity-50 cursor-not-allowed bg-white text-slate-900' : 'bg-white text-slate-900 shadow-xl shadow-black/20'
                }`}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Authorize via UPI <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
