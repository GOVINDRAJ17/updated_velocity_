import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRides } from '../contexts/RideContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { SplitPayment } from './SplitPayment';
import { WalletView } from './WalletView';
import { RideAnalytics } from './RideAnalytics';
import { useNavigate } from 'react-router-dom';

// Deconstructed Components
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileOverview } from './profile/ProfileOverview';
import { ProfileStats } from './profile/ProfileStats';
import { ProfileAchievements } from './profile/ProfileAchievements';
import { ProfileTrust } from './profile/ProfileTrust';
import { ProfileRides } from './profile/ProfileRides';
import { EditProfileModal } from './profile/EditProfileModal';
import { EditRideModal } from './profile/EditRideModal';
import { ProfileWallet } from './profile/ProfileWallet';
import { fetchWalletBalance } from '../lib/wallet';
import { LocationInput, Location } from './LocationInput';

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [authoredRides, setAuthoredRides] = useState<any[]>([]);
  const [joinedRides, setJoinedRides] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingRide, setEditingRide] = useState<any>(null);
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
  
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Form State
  const [formData, setFormData] = useState({
    full_name: '', username: '', bio: '', phone: '', gender: '', dob: '',
    bike_model: '', vehicle_type: 'Bike', number_plate: '', plate_private: false,
    experience_level: 'Beginner', avatar_url: '', upi_id: ''
  });

  const isGuest = !profile || profile.id === 'guest';

  useEffect(() => {
    fetchProfileData();
    
    // Subscribe to balance changes
    const channel = supabase.channel('wallet-sync')
      .on('postgres_changes', { event: '*', table: 'profiles' }, () => {
         loadBalance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          level: 1, level_name: 'Beginner', total_distance: 0, total_time: 0, routes_completed: 0
        });
        setIsLoading(false);
        return;
      }

      // Fetch user profile
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
      if (joined) setJoinedRides(joined.map(j => j.rides));

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
      console.warn(err);
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

      const upiPattern = /^[\w.-]+@[\w.-]+$/;
      if (formData.upi_id && !upiPattern.test(formData.upi_id)) {
        throw new Error("Invalid UPI ID format. Please use 'name@bank' format.");
      }

      const updatePayload = {
        full_name: formData.full_name,
        username: formData.username || null,
        upi_id: formData.upi_id || null,
        bio: formData.bio,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob || null,
        bike_model: formData.bike_model,
        vehicle_type: formData.vehicle_type,
        number_plate: formData.number_plate,
        plate_private: formData.plate_private,
        experience_level: formData.experience_level,
        avatar_url: formData.avatar_url
      };

      const { data, error } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id).select();
      
      if (error) {
        if (error.code === '23505') throw new Error("Username is already taken!");
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Database rejected the save securely. Are you logged in via Dev Mode? Or you may need to run the SQL schema update.");
      }
      
      await fetchProfileData();
      setIsEditing(false);
      toastSuccess('Profile updated successfully!');
    } catch (err: any) {
      toastError('Save failed: ' + (err.message || 'Unknown error'));
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to end this ride? It will be marked as completed and removed from active listings.")) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase.from('rides').update({ status: 'completed' }).eq('id', rideId);
      if (error) throw error;
      
      await refreshRides();
      await fetchProfileData();
      alert("Ride ended successfully.");
    } catch (err: any) {
      alert("Failed to end ride: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (!confirm("🚨 PERMANENT ACTION: Are you sure you want to DELETE this ride? This will remove all associated data and cannot be undone.")) return;
    
    try {
      setIsSaving(true);
      // We perform the delete and select to ensure the row was removed
      const { data, error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId)
        .select();
      
      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Deletion failed. This ride may have already been removed OR you don't have permission to delete it (RLS policy).");
      }
      
      await refreshRides();
      await fetchProfileData();
      
      alert("🗑️ Formation removed from network.");
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert("🔴 " + (err.message || "Unknown error during deletion."));
    } finally {
      setIsSaving(false);
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
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 space-y-6">
        <div className="animate-pulse flex items-center gap-4 pt-12">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-white/5 rounded w-1/2" />
            <div className="h-4 bg-white/5 rounded w-1/3" />
          </div>
        </div>
        <div className="animate-pulse h-32 bg-white/5 rounded-3xl" />
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

  return (
    <div className={`min-h-screen pb-24 pt-4 relative w-full transition-colors duration-300 ${isDark ? 'text-white bg-[#0B0F19]' : 'text-slate-900 bg-slate-50'}`}>
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full md:w-1/2 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
        </div>
      )}

      <ProfileHeader username={profile?.username} isDark={isDark} />

      <ProfileOverview 
        profile={profile} 
        session={session} 
        isDark={isDark} 
        onEdit={() => setIsEditing(true)} 
        onShare={shareProfile} 
      />

      <ProfileWallet 
        balance={walletBalance} 
        isGuest={isGuest} 
        isDark={isDark} 
        onShowWallet={() => setShowWalletOverlay(true)}
        onShowSplits={() => setShowSplitOverlay(true)}
      />

      <ProfileStats 
        routesCount={profile?.routes_completed || 0} 
        groupsCount={joinedRides.length} 
        distance={profile?.total_distance || 0} 
        isDark={isDark} 
      />

      <ProfileAchievements 
        authoredRidesCount={authoredRides.length} 
        joinedRidesCount={joinedRides.length} 
        phone={profile?.phone} 
        isGuest={isGuest} 
        isDark={isDark} 
      />

      <ProfileTrust 
        authoredRidesCount={authoredRides.length} 
        joinedRidesCount={joinedRides.length} 
        phone={profile?.phone} 
        experienceLevel={profile?.experience_level} 
        isGuest={isGuest} 
        isDark={isDark} 
      />

      <ProfileRides 
        authoredRides={authoredRides} 
        onEditRide={setEditingRide} 
        isDark={isDark} 
      />

      <EditRideModal 
        editingRide={editingRide} 
        setEditingRide={setEditingRide} 
        isSaving={isSaving} 
        onSave={async () => {
          try {
            setIsSaving(true);
            const { error } = await supabase.from('rides').update({
              title: editingRide.title,
              start_location: editingRide.start_location,
              end_location: editingRide.end_location,
              start_lat: editingRide.start_lat,
              start_lng: editingRide.start_lng,
              end_lat: editingRide.end_lat,
              end_lng: editingRide.end_lng,
              route: `${editingRide.start_location?.split(',')[0]} to ${editingRide.end_location?.split(',')[0]}`,
              ride_date: editingRide.ride_date,
              ride_time: editingRide.ride_time,
              max_members: editingRide.max_members
            }).eq('id', editingRide.id);
            
            if (error) throw error;
            await refreshRides();
            await fetchProfileData();
            setEditingRide(null);
            alert("✅ Formation parameters successfully updated.");
          } catch (err: any) {
            alert("🔴 Update failed: " + err.message);
          } finally {
            setIsSaving(false);
          }
        }} 
        onCancel={() => setEditingRide(null)} 
      />

      {showSplitOverlay && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F19]">
          <SplitPayment 
            rideId={undefined as any} 
            onClose={() => setShowSplitOverlay(false)} 
          />
        </div>
      )}

      {showWalletOverlay && (
        <WalletView onClose={() => setShowWalletOverlay(false)} />
      )}

      {selectedRideForAnalytics && (
        <RideAnalytics 
          ride={selectedRideForAnalytics} 
          onClose={() => setSelectedRideForAnalytics(null)} 
        />
      )}

      <footer className="relative z-10 px-6 pt-12 pb-12 text-center opacity-30">
        <div className={`h-[1px] w-12 mx-auto mb-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        <div className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          © Velocity Team. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
