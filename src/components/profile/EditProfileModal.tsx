import { Camera, Image as ImageIcon, Bike, Car, Trophy, Shield, CheckCircle, X } from 'lucide-react';
import { useRef, ChangeEvent } from 'react';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1558981420-c532902e58b4?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1525160354652-2591604a11f2?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
];

interface EditProfileModalProps {
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  showAvatarPresets: boolean;
  setShowAvatarPresets: (show: boolean) => void;
  session: any;
}

export function EditProfileModal({ 
  formData, setFormData, isSaving, onSave, onCancel, 
  onFileUpload, showAvatarPresets, setShowAvatarPresets, session 
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white overflow-y-auto pb-24 duration-300 animate-in fade-in zoom-in-95">
      <div className="sticky top-0 bg-[#0B0F19]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5 z-20">
        <button onClick={onCancel} className="text-slate-400 font-medium hover:text-white transition-colors">Cancel</button>
        <h2 className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Edit Profile</h2>
        <button onClick={onSave} disabled={isSaving} className="text-blue-400 hover:text-blue-300 font-bold disabled:opacity-50 transition-colors bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 shadow-inner">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="p-4 space-y-8 max-w-lg mx-auto mt-4 relative z-10">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <img 
              src={formData.avatar_url || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop"} 
              alt="Avatar" 
              className="relative w-32 h-32 rounded-full border-4 border-[#0B0F19] object-cover shadow-2xl transition-transform active:scale-95"
            />
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-full border-4 border-[#0B0F19] shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/*" className="hidden" />
          </div>
          
          <button onClick={() => setShowAvatarPresets(!showAvatarPresets)} className="mt-4 text-sm text-blue-400 font-bold flex items-center gap-1.5 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 active:scale-95 transition-transform">
            <ImageIcon className="w-4 h-4" /> Or choose preset
          </button>
          
          {showAvatarPresets && (
            <div className="mt-5 grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-3xl w-full border border-white/5 shadow-inner">
              {PRESET_AVATARS.map((url, i) => (
                <img 
                  key={i} src={url} alt="preset" 
                  onClick={() => { setFormData({...formData, avatar_url: url}); setShowAvatarPresets(false); }}
                  className="w-full aspect-square rounded-2xl object-cover cursor-pointer hover:border-2 hover:border-blue-500 active:scale-95 transition-all shadow-md"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Core Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Public Details</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-inner space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Name</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full bg-black/20 border border-white/5 rounded-2xl pl-9 pr-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" placeholder="username" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Bio</label>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all resize-none h-24" placeholder="Adrenaline junkie. Sunday rider." maxLength={150} />
                <div className="text-right text-[10px] font-bold text-slate-500 mt-1 mr-1">{formData.bio.length}/150</div>
              </div>
            </div>
          </div>

          {/* Ride Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2"><Trophy className="w-4 h-4 text-yellow-500"/> Ride Identity</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-inner space-y-4">
              <div className="flex bg-black/40 p-1.5 rounded-2xl shadow-inner border border-white/5">
                <button type="button" onClick={() => setFormData({...formData, vehicle_type: 'Bike'})} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.vehicle_type === 'Bike' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}><Bike className="w-4 h-4"/> Bike</button>
                <button type="button" onClick={() => setFormData({...formData, vehicle_type: 'Car'})} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.vehicle_type === 'Car' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}><Car className="w-4 h-4"/> Car</button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Vehicle Model</label>
                <input type="text" value={formData.bike_model} onChange={e => setFormData({...formData, bike_model: e.target.value})} className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" placeholder="e.g. Royal Enfield Classic 350" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Number Plate</label>
                  <input type="text" value={formData.number_plate} onChange={e => setFormData({...formData, number_plate: e.target.value.toUpperCase()})} className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" placeholder="MH 04 AB 1234" />
                </div>
                <div className="flex flex-col items-center justify-center pt-5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Private</label>
                  <button type="button" onClick={() => setFormData({...formData, plate_private: !formData.plate_private})} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${formData.plate_private ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.plate_private ? 'left-7 shadow-md' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Experience Level</label>
                <select value={formData.experience_level} onChange={e => setFormData({...formData, experience_level: e.target.value})} className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all appearance-none text-white font-medium">
                  <option value="Beginner">Beginner (0-1 yr)</option>
                  <option value="Intermediate">Intermediate (1-3 yrs)</option>
                  <option value="Advanced">Advanced (3-5 yrs)</option>
                  <option value="Pro">Pro Rider (5+ yrs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Private Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2"><Shield className="w-4 h-4 text-indigo-400"/> Account Details</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-inner space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">Email <span className="text-red-400/80 text-[10px] ml-1 px-1.5 py-0.5 bg-red-500/10 rounded-md">Read Only</span></label>
                <input type="email" value={session?.user?.email || ''} readOnly className="w-full bg-black/40 border border-red-500/10 rounded-2xl px-4 py-3.5 outline-none text-slate-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ml-1">UPI ID <span className="text-blue-400 text-[10px] ml-1">Mandatory for Splits</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.upi_id} 
                    onChange={e => setFormData({...formData, upi_id: e.target.value.toLowerCase()})} 
                    className={`w-full bg-black/20 border-2 rounded-2xl px-4 py-3.5 outline-none transition-all pr-12
                      ${formData.upi_id ? (/^[\w.-]+@[\w.-]+$/.test(formData.upi_id) ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-white/5 focus:border-blue-500/50'}
                    `}
                    placeholder="name@okbank" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {formData.upi_id && (
                      /^[\w.-]+@[\w.-]+$/.test(formData.upi_id) 
                        ? <CheckCircle className="w-5 h-5 text-green-500" /> 
                        : <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {formData.upi_id && !/^[\w.-]+@[\w.-]+$/.test(formData.upi_id) && (
                  <p className="text-[10px] text-red-400 mt-2 ml-1 font-bold uppercase tracking-tight">Invalid format (e.g. name@bank)</p>
                )}
                {formData.upi_id && /^[\w.-]+@[\w.-]+$/.test(formData.upi_id) && (
                  <p className="text-[10px] text-green-500 mt-2 ml-1 font-bold uppercase tracking-tight">UPI ID Verified</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
