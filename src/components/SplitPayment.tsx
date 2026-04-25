import { useState, useEffect } from 'react';
import { 
  Plus, Users, IndianRupee, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, Send, X, Calculator, PieChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  fetchRideSplits, createSplit, fetchUserBills, 
  Split, SplitMember 
} from '../lib/payments';
import { useTheme } from '../contexts/ThemeContext';
import { useRides } from '../contexts/RideContext';
import { PaymentPortal } from './PaymentPortal';


interface SplitPaymentProps {
  rideId: string;
  onClose: () => void;
}

export function SplitPayment({ rideId: propRideId, onClose }: SplitPaymentProps) {
  const { theme } = useTheme();
  const { myRides } = useRides();
  const [selectedRideId, setSelectedRideId] = useState<string | null>(propRideId || null);
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activePayment, setActivePayment] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // Split Creation State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    getCurrentUser();
    
    // If no ride provided, use myRides from context
    if (!selectedRideId) {
       setAvailableRides(myRides);
       setLoading(false);
       return;
    }

    // UUID Validation
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedRideId);
    if (!isUuid) {
       setLoading(false);
       return;
    }

    loadData();
    fetchParticipants();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', table: 'splits', filter: `ride_id=eq.${selectedRideId}` }, 
        () => loadData()
      )
      .on('postgres_changes', 
        { event: 'UPDATE', table: 'split_members' }, 
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRideId, myRides]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    setCurrentUser(profile);
  };

  const loadData = async () => {
    if (!selectedRideId) return;
    try {
      setLoading(true);
      const data = await fetchRideSplits(selectedRideId);
      setSplits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedRideId) return;
    const { data, error } = await supabase
      .from('rides')
      .select('driver:profiles!driver_id(id, full_name, avatar_url), participants:ride_participants(user_id, profile:profiles(id, full_name, avatar_url))')
      .eq('id', selectedRideId)
      .single();

    if (data) {
      const all: any[] = [];
      if (data.driver) all.push(data.driver);
      
      data.participants?.forEach((p: any) => {
        if (p.profile) all.push(p.profile);
      });
      
      setParticipants(all);
      
      // Initialize custom amounts
      const initial: Record<string, string> = {};
      all.forEach(p => initial[p.id] = '');
      setCustomAmounts(initial);
    }
  };

  const handleCreateSplit = async () => {
    if (!title || !amount || parseFloat(amount) <= 0) return;

    try {
      if (!currentUser?.upi_id) {
        alert("🚨 IDENTITY ERROR: You must link a valid UPI ID in your Profile before creating a split. This ensures you can receive payments.");
        return;
      }

      const total = parseFloat(amount);
      let memberData: { user_id: string; amount: number }[] = [];

      if (splitType === 'equal') {
        const perPerson = total / participants.length;
        memberData = participants.map(p => ({ user_id: p.id, amount: perPerson }));
      } else {
        memberData = participants.map(p => ({ 
          user_id: p.id, 
          amount: parseFloat(customAmounts[p.id] || '0') 
        }));
        
        const sum = memberData.reduce((acc, m) => acc + m.amount, 0);
        if (Math.abs(sum - total) > 0.01) {
          alert(`Amounts don't match total! Sum: ₹${sum.toFixed(2)}, Expected: ₹${total}`);
          return;
        }
      }

      await createSplit(selectedRideId, title, total, memberData, currentUser.id);
      setShowCreate(false);
      setTitle('');
      setAmount('');
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const initiatePayment = async (member: any, split: any) => {
    try {
      if (!currentUser?.upi_id) {
        alert("🚨 IDENTITY ERROR: Please add your UPI ID in Profile to participate in splits.");
        return;
      }

      // Find creator UPI
      const { data: creator } = await supabase
        .from('profiles')
        .select('upi_id')
        .eq('id', split.created_by)
        .single();

      if (!creator?.upi_id) {
        alert("Split creator hasn't linked a UPI ID yet. They must do so before you can settle.");
        return;
      }

      setActivePayment({ 
        member, 
        split, 
        creatorUpi: creator.upi_id 
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!selectedRideId) {
    return (
      <div className={`flex-1 flex flex-col h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'}`}>
        <div className="px-6 py-8 flex items-center justify-between border-b border-white/5 bg-black/20">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Select Formation</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Pick a ride to manage splits</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl border border-white/5"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {availableRides.length === 0 ? (
            <div className="text-center py-20 opacity-50">
               <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-sm font-bold uppercase tracking-widest leading-loose">No active formations<br/>found in your ledger</p>
            </div>
          ) : (
            availableRides.map((ride, idx) => (
              <div 
                key={`${ride.id}-${idx}`} 
                onClick={() => setSelectedRideId(ride.id)}
                className="group bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-blue-500/10 hover:to-indigo-500/5 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-lg"
              >
                <div className="space-y-1.5">
                   <h3 className="font-black text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none">{ride.title}</h3>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5"/> {ride.ride_date || 'Unknown Date'}
                   </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-xl">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const ride = myRides.find(r => r.id === selectedRideId);

  return (
    <div className={`flex-1 flex flex-col h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'}`}>
      <div className="px-6 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
           {!propRideId && (
             <button onClick={() => setSelectedRideId(null)} className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors shadow-inner">
                <ChevronRight className="w-5 h-5 rotate-180 text-slate-400" />
             </button>
           )}
           <div>
              <h2 className="text-xl font-black leading-tight uppercase tracking-tight">{ride?.title || 'Split Ledger'}</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                <PieChart className="w-3 h-3 text-blue-500" /> Squad Expenses
              </p>
           </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24">
        {loading && splits.length === 0 ? (
          <div className="py-20 text-center animate-pulse">
            <Clock className="w-8 h-8 text-slate-700 mx-auto mb-4" />
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Accessing Ledger...</p>
          </div>
        ) : splits.length === 0 && !showCreate ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/10">
              <IndianRupee className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">No active splits</h3>
            <p className="text-slate-500 text-sm mb-8 px-10">Create a split for fuel, food, or other expenses shared by the squad.</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-white/5"
            >
              Start New Split
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {splits.map((split: any, idx: number) => {
              const myEntry = split.split_members.find((m: any) => m.user_id === currentUser?.id);
              const paidCount = split.split_members.filter((m: any) => m.payment_status === 'paid').length;
              const totalCount = split.split_members.length;
              const progress = (paidCount / totalCount) * 100;
              const isOwner = split.created_by === currentUser?.id;

              return (
                <div key={`${split.id}-${idx}`} className="bg-gradient-to-br from-[#121624] to-[#0B0F19] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                   
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{split.title}</h4>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3 h-3" /> {new Date(split.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-right">
                         <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Pool</div>
                         <div className="text-sm font-black text-white">₹{split.total_amount}</div>
                      </div>
                   </div>

                   {/* Progress */}
                   <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SQUAD SETTLEMENT</span>
                         <span className="text-[10px] font-black text-blue-400">{paidCount}/{totalCount} PAID</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div 
                           className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                           style={{ width: `${progress}%` }} 
                         />
                      </div>
                   </div>

                   {/* Members */}
                   <div className="space-y-3 mb-6">
                      {split.split_members.map((member: any, i: number) => (
                        <div key={`${member.id}-${i}`} className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-3">
                              <img src={member.profiles?.avatar_url || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                              <div>
                                 <div className="text-[11px] font-black text-white">{member.profiles?.full_name}</div>
                                 <div className="text-[9px] font-bold text-slate-500">₹{member.amount.toFixed(2)}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              {member.payment_status === 'paid' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <div className="text-[8px] font-black text-slate-500 border border-white/10 px-2 py-1 rounded-md uppercase tracking-widest">Pending</div>
                              )}
                              {isOwner && member.payment_status === 'pending' && member.user_id !== currentUser?.id && (
                                <button className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                                   <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* My Action */}
                   {myEntry && myEntry.payment_status === 'pending' && (
                     <button 
                       onClick={() => initiatePayment(myEntry, split)}
                       className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                     >
                        Secure Pay ₹{myEntry.amount.toFixed(2)}
                     </button>
                   )}
                   {myEntry && myEntry.payment_status === 'paid' && (
                     <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl py-4 text-center font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Settlement Complete
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!showCreate && !activePayment && (
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <button 
            onClick={() => setShowCreate(true)}
            className="w-full bg-white text-slate-900 rounded-[2rem] py-5 font-black text-xs uppercase tracking-widest shadow-2xl shadow-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Split
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-white tracking-tight">Create Split</h3>
                 <button onClick={() => setShowCreate(false)} className="p-2 bg-white/5 rounded-xl text-slate-400"><X className="w-6 h-6"/></button>
              </div>

              <div className="space-y-8 pb-20">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Expense Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Premium Fuel or Highway Snacks"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Total Amount (₹)</label>
                    <div className="relative">
                       <input 
                        type="number" 
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                 </div>

                 <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Split Strategy</label>
                       <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setSplitType('equal')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${splitType === 'equal' ? 'bg-white text-slate-900' : 'text-slate-400'}`}
                          >
                            Equal
                          </button>
                          <button 
                            onClick={() => setSplitType('custom')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${splitType === 'custom' ? 'bg-white text-slate-900' : 'text-slate-400'}`}
                          >
                            Custom
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       {participants.map((p, i) => {
                         const equalShare = amount ? (parseFloat(amount) / participants.length).toFixed(2) : '0.00';
                         return (
                          <div key={`${p.id}-${i}`} className="flex items-center justify-between gap-4 p-3 bg-black/20 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-3">
                                <img src={p.avatar_url || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-white/10" />
                                <span className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{p.full_name}</span>
                             </div>
                             {splitType === 'equal' ? (
                               <div className="text-xs font-black text-blue-400">₹{equalShare}</div>
                             ) : (
                               <div className="relative w-24">
                                  <input 
                                    type="number"
                                    value={customAmounts[p.id]}
                                    onChange={(e) => setCustomAmounts({...customAmounts, [p.id]: e.target.value})}
                                    placeholder="0"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-blue-500/50"
                                  />
                               </div>
                             )}
                          </div>
                         );
                       })}
                    </div>
                 </div>

                 <button 
                  onClick={handleCreateSplit}
                  className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-900/40 active:scale-95 transition-all"
                 >
                    Deploy Ledger
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Unified Payment Portal */}
      {activePayment && (
        <div className="fixed inset-0 z-[60] bg-[#0B0F19]/95 flex flex-col justify-center p-6 animate-in fade-in duration-300">
          <PaymentPortal 
            amount={activePayment.member.amount}
            splitMemberId={activePayment.member.id}
            splitId={activePayment.split.id}
            splitTitle={activePayment.split.title}
            creatorUpi={activePayment.creatorUpi}
            onSuccess={() => {
              setActivePayment(null);
              loadData();
            }}
            onCancel={() => setActivePayment(null)}
          />
        </div>
      )}
    </div>
  );
}
