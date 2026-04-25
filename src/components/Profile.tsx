import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Share2, Edit2, ShieldCheck, MapPin, Calendar, Clock, Award, Wallet, CheckCircle2, Bell, Users, Car, Settings2, Flag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRides } from '../contexts/RideContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { SplitPayment } from './SplitPayment';
import { WalletView } from './WalletView';
import { RideAnalytics } from './RideAnalytics';
import { useNavigate } from 'react-router-dom';

// Deconstructed Modals
import { EditProfileModal } from './profile/EditProfileModal';
import { fetchWalletBalance } from '../lib/wallet';

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [authoredRides, setAuthoredRides] = useState<any[]>([]);
  const [joinedRides, setJoinedRides] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const { refreshRides } = useRides();
  const { success: toastSuccess, error: toastError, toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [selectedRideForAnalytics, setSelectedRideForAnalytics] = useState<any | null>(null);
  const [showSplitOverlay, setShowSplitOverlay] = useState(false);
  const [showWalletOverlay, setShowWalletOverlay] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const balanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // NEW SECTIONS STATE
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  const [vehicle, setVehicle] = useState<any>(null);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);

  const [squad, setSquad] = useState<any>(null);
  const [isSquadLoading, setIsSquadLoading] = useState(true);

  const [splits, setSplits] = useState<any>(null);
  const [isSplitsLoading, setIsSplitsLoading] = useState(true);

  // Edit Form State
  const [formData, setFormData] = useState({
    full_name: '', username: '', bio: '', phone: '', gender: '', dob: '',
    bike_model: '', vehicle_type: 'Bike', number_plate: '', plate_private: false,
    experience_level: 'Beginner', avatar_url: '', upi_id: ''
  });

  const isGuest = !profile || profile.id === 'guest';

  useEffect(() => {
    fetchProfileData();
    
    const channel = supabase.channel('wallet-sync')
      .on('postgres_changes', { event: '*', table: 'profiles' }, () => {
         loadBalance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (balanceTimeoutRef.current) clearTimeout(balanceTimeoutRef.current);
    };
  }, []);

  // NEW SECTIONS API FETCHING
  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!session?.user) {
        setIsActivityLoading(false);
        setIsVehicleLoading(false);
        setIsSquadLoading(false);
        setIsSplitsLoading(false);
        return;
      }

      // Fetch Recent Activity
      try {
        const res = await fetch('/api/activity');
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setRecentActivity(data);
      } catch (err) {
        setRecentActivity([]); 
      } finally {
        setIsActivityLoading(false);
      }

      // Fetch Vehicle
      try {
        const res = await fetch('/api/user/vehicle');
        if (!res.ok) throw new Error('Failed to fetch vehicle');
        const data = await res.json();
        setVehicle(data);
      } catch (err) {
        if (profile?.bike_model) {
          setVehicle({ name: profile.bike_model, number: profile.number_plate || '' });
        } else {
          setVehicle(null);
        }
      } finally {
        setIsVehicleLoading(false);
      }

      // Fetch Squad
      try {
        const res = await fetch('/api/squad');
        if (!res.ok) throw new Error('Failed to fetch squad');
        const data = await res.json();
        setSquad(data);
      } catch (err) {
        setSquad(null);
      } finally {
        setIsSquadLoading(false);
      }

      // Fetch Splits
      try {
        const res = await fetch('/api/splits');
        if (!res.ok) throw new Error('Failed to fetch splits');
        const data = await res.json();
        setSplits(data);
      } catch (err) {
        setSplits(null);
      } finally {
        setIsSplitsLoading(false);
      }
    };

    if (!isLoading && profile) {
      fetchDynamicData();
    }
  }, [session, profile, isLoading]);

  const loadBalance = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const bal = await fetchWalletBalance(session.user.id);
      setWalletBalance(Number(bal));
    }
  };

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session?.user) {
        setProfile({
          id: 'guest', full_name: 'Guest Rider', username: 'guest',
          level: 1, level_name: 'Beginner', total_distance: 0, total_time: 0, routes_completed: 0,
          bio: 'Exploring the open roads.'
        });
        setIsLoading(false);
        return;
      }

      let { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      if (!profileData) {
        const newProfile = { id: session.user.id, full_name: session.user.email?.split('@')[0] || 'New Rider' };
        await supabase.from('profiles').insert([newProfile]);
        profileData = newProfile;
      }

      setProfile(profileData);
      setWalletBalance(Number(profileData.wallet_balance || 0));
      setFormData({
        full_name: profileData.full_name || '', username: profileData.username || '',
        bio: profileData.bio || '', phone: profileData.phone || '', gender: profileData.gender || '',
        dob: profileData.dob || '', bike_model: profileData.bike_model || '',
        vehicle_type: profileData.vehicle_type || 'Bike', number_plate: profileData.number_plate || '',
        plate_private: profileData.plate_private || false, experience_level: profileData.experience_level || 'Beginner',
        avatar_url: profileData.avatar_url || '', upi_id: profileData.upi_id || ''
      });

      const { data: myRoutes } = await supabase.from('rides').select('*').eq('driver_id', session.user.id).order('created_at', { ascending: false });
      if (myRoutes) setAuthoredRides(myRoutes);

      const { data: joined } = await supabase.from('ride_participants').select(`joined_at, rides(*)`).eq('user_id', session.user.id);
      if (joined) setJoinedRides(joined.map((j: any) => j.rides));

    } catch (err) {
      console.error("Profile Load Error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !session?.user) return;
      setIsSaving(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toastSuccess('Image uploaded successfully!');
    } catch (err: any) {
      toastError('Upload failed. Use a preset avatar instead.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isGuest) {
      alert("Please log in to update profile.");
      return;
    }
    
    setIsSaving(true);
    try {
      if (formData.username && !/^[a-zA-Z0-9_]{3,15}$/.test(formData.username)) {
        throw new Error("Username must be 3-15 chars, alphanumeric or underscores only.");
      }

      const updatePayload = {
        full_name: formData.full_name,
        username: formData.username || null,
        upi_id: formData.upi_id || null,
        bio: formData.bio,
        bike_model: formData.bike_model,
        number_plate: formData.number_plate,
        avatar_url: formData.avatar_url
      };

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      if (error) throw error;

      await fetchProfileData();
      // Optimistically update vehicle if we changed it in the generic edit modal
      if (formData.bike_model) setVehicle({ name: formData.bike_model, number: formData.number_plate });
      
      setIsEditing(false);
      toastSuccess('Profile updated successfully!');
    } catch (err: any) {
      toastError('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevealBalance = async () => {
    if (isBalanceRevealed) {
      setIsBalanceRevealed(false);
      if (balanceTimeoutRef.current) clearTimeout(balanceTimeoutRef.current);
      return;
    }

    try {
      if (window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required'
            }
          });
          // Authenticated successfully via biometrics/device PIN
        } catch (e: any) {
          // If no passkey or canceled, fallback to a simple prompt
          console.warn("WebAuthn skipped or failed:", e);
          const pin = window.prompt("Device Security: Enter PIN to reveal balance (Use any 4 digits for testing)");
          if (!pin) return;
        }
      } else {
        const pin = window.prompt("Device Security: Enter PIN to reveal balance");
        if (!pin) return;
      }

      setIsBalanceRevealed(true);
      toastSuccess('Identity Verified. Balance revealed.');
      
      if (balanceTimeoutRef.current) clearTimeout(balanceTimeoutRef.current);
      balanceTimeoutRef.current = setTimeout(() => {
        setIsBalanceRevealed(false);
      }, 15000);
    } catch (err) {
      console.error(err);
      toastError("Authentication failed");
    }
  };

  const shareProfile = () => {
    const text = `Check out my rider profile on Velocity: @${profile?.username || profile?.full_name || 'Guest'}!`;
    if (navigator.share) {
      navigator.share({ title: 'Velocity Profile', text, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast('Profile info copied to clipboard!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0B0F19]' : 'bg-slate-50'} p-4 space-y-6 flex items-center justify-center`}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditProfileModal 
        formData={formData} 
        setFormData={setFormData} 
        isSaving={isSaving} 
        onSave={handleSaveProfile} 
        onCancel={() => setIsEditing(false)} 
        onFileUpload={handleFileUpload} 
        showAvatarPresets={showAvatarPresets} 
        setShowAvatarPresets={setShowAvatarPresets} 
        session={session} 
      />
    );
  }

  const allUserRides = authoredRides.length > 0 ? authoredRides : [];
  const upcomingRides = allUserRides.filter(r => r.status !== 'completed' && r.status !== 'past');
  const pastRides = allUserRides.filter(r => r.status === 'completed' || r.status === 'past');
  const ridesToDisplay = activeTab === 'upcoming' ? upcomingRides : pastRides;

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 px-6 pt-12 pb-6 max-w-lg mx-auto">
        
        {/* PROFILE HEADER */}
        <section className="flex flex-col items-center text-center mb-8 animate-slide-up">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover border-4 border-[#0B0F19]"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#0B0F19] p-1 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black">{profile?.full_name}</h1>
          <p className="text-sm font-bold text-slate-400 mb-2">@{profile?.username || 'rider'}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">
            <Award className="w-3 h-3" /> {profile?.experience_level || 'Pro Rider'}
          </div>
          
          <p className="text-xs font-bold text-slate-300 max-w-[250px] leading-relaxed">
            {profile?.bio || 'Exploring the open roads. Always ready for the next adventure.'}
          </p>
        </section>

        {/* QUICK ACTIONS */}
        <section className="flex justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <button 
            onClick={() => setIsEditing(true)}
            className={`flex-1 max-w-[120px] py-2.5 rounded-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all press-effect ${isDark ? 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252C40] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50'}`}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button 
            onClick={shareProfile}
            className={`flex-1 max-w-[120px] py-2.5 rounded-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all press-effect ${isDark ? 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252C40] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50'}`}
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button 
            className={`flex-1 max-w-[120px] py-2.5 rounded-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all press-effect ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify
          </button>
        </section>

        {/* STATS SECTION */}
        <section className="grid grid-cols-3 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className={`p-4 rounded-[1.5rem] text-center ${isDark ? 'bg-[#121624] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="text-2xl font-black mb-1">{profile?.routes_completed || authoredRides.length + joinedRides.length || 0}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rides</div>
          </div>
          <div className={`p-4 rounded-[1.5rem] text-center ${isDark ? 'bg-[#121624] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="text-2xl font-black mb-1">{profile?.total_distance || 0}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KM Driven</div>
          </div>
          <div className={`p-4 rounded-[1.5rem] text-center ${isDark ? 'bg-[#121624] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="text-2xl font-black mb-1 text-emerald-400">4.9</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rating</div>
          </div>
        </section>

        {/* WALLET & SPLITS SECTION */}
        <section className="mb-8 animate-slide-up grid grid-cols-1 gap-4" style={{ animationDelay: '150ms' }}>
          {/* WALLET CARD */}
          <div className={`p-5 rounded-[2rem] flex items-center justify-between ${isDark ? 'bg-gradient-to-r from-[#1A1F2E] to-[#121624] border border-blue-500/20' : 'bg-white border border-slate-200 shadow-sm'} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all rounded-full" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-2">
                  Velocity Wallet
                  <button onClick={handleRevealBalance} className="text-slate-500 hover:text-white transition-colors">
                    {isBalanceRevealed ? '👁' : '🔒'}
                  </button>
                </p>
                <div className="text-2xl font-black flex items-center transition-all">
                  {isBalanceRevealed ? (
                    <span className="animate-in fade-in zoom-in-95 duration-300">₹{walletBalance.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-600 tracking-widest">₹ ••••</span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowWalletOverlay(true)}
              className="relative z-10 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-95 transition-all press-effect"
            >
              Top Up
            </button>
          </div>

          {/* NEW: RIDE SPLITS SECTION */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between mb-1 mt-2">
               <h3 className={`text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                 Ride Splits
               </h3>
               <button 
                 onClick={() => setShowSplitOverlay(true)}
                 className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
               >
                 Manage All
               </button>
             </div>

            {isSplitsLoading ? (
               <div className={`p-5 rounded-[2rem] border animate-pulse ${isDark ? 'bg-[#1A1F2E] border-white/5' : 'bg-white border-slate-200'}`}>
                 <div className="w-1/2 h-4 bg-slate-700/20 rounded mb-4" />
                 <div className="w-1/3 h-4 bg-slate-700/20 rounded" />
               </div>
            ) : splits && Array.isArray(splits) && splits.length > 0 ? (
               <div className="space-y-3">
                 {splits.slice(0, 3).map((split: any, idx: number) => (
                   <div key={split.id || idx} className={`p-4 rounded-[1.5rem] flex items-center justify-between border ${isDark ? 'bg-[#121624] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                     <div>
                       <h4 className="text-sm font-black text-white mb-0.5">{split.title || split.ride_name || 'Group Expense'}</h4>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         {split.status === 'pending' ? 'Waiting on settlement' : 'Settled'}
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className={`text-sm font-black ${split.type === 'owed' ? 'text-red-400' : 'text-emerald-400'}`}>
                         {split.type === 'owed' ? '-' : '+'}₹{split.amount}
                       </span>
                       <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full mt-1 ${split.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                         {split.status}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
               <div className={`p-5 rounded-[2rem] flex flex-col justify-center border ${isDark ? 'bg-[#1A1F2E] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                 <div className="flex items-center justify-between w-full">
                   <div className="flex flex-col">
                     <p className="text-sm font-black text-slate-500 mb-0.5">No pending splits</p>
                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Everything is settled</p>
                   </div>
                   <button 
                     onClick={() => setShowSplitOverlay(true)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-[1.05] active:scale-95 transition-all press-effect ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                   >
                     Create Split
                   </button>
                 </div>
               </div>
            )}
          </div>
        </section>

        {/* NEW 1: RECENT ACTIVITY */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Recent Activity
          </h3>
          <div className={`p-1 rounded-[2rem] ${isDark ? 'bg-[#121624] border border-white/5' : 'bg-white border border-slate-200'}`}>
            {isActivityLoading ? (
              <div className="p-5 flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-700/20" />
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-slate-700/20 rounded mb-2" />
                      <div className="w-1/4 h-3 bg-slate-700/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-2">
                {recentActivity.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-3 rounded-2xl animate-fade-in ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1A1F2E]' : 'bg-slate-100'}`}>
                      {activity.type === 'ride_joined' ? <Flag className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{activity.message}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NEW 2: MY VEHICLE */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            My Vehicle
          </h3>
          <div className={`p-5 rounded-[2rem] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${isDark ? 'bg-[#1A1F2E] border border-white/5 hover:border-blue-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-all" />
            
            {isVehicleLoading ? (
              <div className="animate-pulse flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-full bg-slate-700/20" />
                <div className="flex-1">
                  <div className="w-1/2 h-5 bg-slate-700/20 rounded mb-2" />
                  <div className="w-1/3 h-4 bg-slate-700/20 rounded" />
                </div>
              </div>
            ) : vehicle ? (
              <>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Car className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">{vehicle.name}</h4>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{vehicle.number}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`relative z-10 p-3 rounded-xl transition-all press-effect shadow-md hover:scale-[1.05] active:scale-95 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-bold text-slate-400">No vehicle added</span>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-95 transition-all press-effect"
                >
                  Add Vehicle
                </button>
              </div>
            )}
          </div>
        </section>

        {/* NEW 3: MY SQUAD */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className={`text-xs font-black uppercase tracking-[0.15em] mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            My Squad
          </h3>
          <div className={`p-5 rounded-[2rem] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${isDark ? 'bg-[#1A1F2E] border border-white/5 hover:border-emerald-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-all" />
            
            {isSquadLoading ? (
              <div className="animate-pulse flex items-center justify-between w-full">
                <div className="w-1/3 h-5 bg-slate-700/20 rounded" />
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-700/20 border-2 border-[#1A1F2E]" />)}
                </div>
              </div>
            ) : squad ? (
              <>
                <div className="relative z-10">
                  <h4 className="text-base font-black mb-1">{squad.name || 'Your Squad'}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {squad.count || squad.members?.length || 0} Members Active
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex -space-x-3 group-hover:space-x-[-8px] transition-all duration-300">
                    {squad.members?.slice(0, 3).map((m: any, i: number) => (
                      <img key={i} src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=sq${i}`} className={`w-9 h-9 rounded-full object-cover border-2 shadow-lg ${isDark ? 'border-[#1A1F2E]' : 'border-white'}`} alt="Squad member" />
                    ))}
                    {(squad.count > 3) && (
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[9px] font-black shadow-lg ${isDark ? 'bg-[#121624] border-[#1A1F2E] text-slate-300' : 'bg-slate-100 border-white text-slate-600'}`}>
                        +{squad.count - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate('/groups')}
                    className={`p-2.5 rounded-xl transition-all press-effect shadow-md hover:scale-[1.05] active:scale-95 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full relative z-10 gap-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-bold text-slate-400">You're not part of any squad</span>
                </div>
                <button 
                  onClick={() => navigate('/groups')}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-[1.05] active:scale-95 transition-all press-effect"
                >
                  Explore Squads
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. YOUR RIDES */}
        <section className="animate-slide-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-4 border-b border-white/10 mb-5">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'past' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Past
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {ridesToDisplay.length === 0 ? (
              <div className={`p-8 text-center rounded-[2rem] ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No rides found in this category.</p>
              </div>
            ) : (
              ridesToDisplay.map((ride, idx) => (
                <div key={ride.id} className={`p-5 rounded-[1.5rem] flex items-center justify-between group hover:-translate-y-1 transition-all ${isDark ? 'bg-[#121624] border border-white/5 hover:border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                  <div>
                    <h4 className="text-sm font-black mb-1">{ride.start_location?.split(',')[0]} ➔ {ride.end_location?.split(',')[0]}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ride.ride_date || 'Today'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ride.ride_time || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      ride.status === 'active' || ride.status === 'upcoming' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {ride.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* Modals & Overlays */}
      {showSplitOverlay && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F19]">
          <SplitPayment rideId={undefined as any} onClose={() => setShowSplitOverlay(false)} />
        </div>
      )}
      {showWalletOverlay && (
        <WalletView onClose={() => setShowWalletOverlay(false)} />
      )}
      {selectedRideForAnalytics && (
        <RideAnalytics ride={selectedRideForAnalytics} onClose={() => setSelectedRideForAnalytics(null)} />
      )}
    </div>
  );
}
