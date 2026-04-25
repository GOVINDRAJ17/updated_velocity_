import { X, MapPin, Target } from 'lucide-react';
import { LocationInput, Location } from '../LocationInput';

interface EditRideModalProps {
  editingRide: any;
  setEditingRide: (ride: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function EditRideModal({ editingRide, setEditingRide, isSaving, onSave, onCancel }: EditRideModalProps) {
  if (!editingRide) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#101524] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#121624]">
          <div>
            <h3 className="font-black text-lg tracking-tight">Edit Formation</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">System ID: {editingRide.id.substring(0,8)}</div>
          </div>
          <button 
            onClick={onCancel} 
            className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
           {/* Form Fields */}
           <div className="space-y-4">
             <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1.5 block">Ride Title</label>
                <input type="text" value={editingRide.title} onChange={e => setEditingRide({...editingRide, title: e.target.value})} className="w-full bg-black/30 border border-white/5 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50" />
             </div>

             <LocationInput 
                label="Start Point" 
                placeholder="Search start..." 
                initialValue={editingRide.start_location}
                icon={<MapPin className="w-4 h-4 text-blue-500" />}
                onSelect={(loc: Location) => setEditingRide({...editingRide, start_location: loc.name, start_lat: loc.lat, start_lng: loc.lng})}
             />

             <LocationInput 
                label="Destination" 
                placeholder="Search destination..." 
                initialValue={editingRide.end_location}
                icon={<Target className="w-4 h-4 text-green-500" />}
                onSelect={(loc: Location) => setEditingRide({...editingRide, end_location: loc.name, end_lat: loc.lat, end_lng: loc.lng})}
             />

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1.5 block">Date</label>
                  <input type="date" value={editingRide.ride_date} onChange={e => setEditingRide({...editingRide, ride_date: e.target.value})} className="w-full bg-black/30 border border-white/5 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1.5 block">Time</label>
                  <input type="time" value={editingRide.ride_time} onChange={e => setEditingRide({...editingRide, ride_time: e.target.value})} className="w-full bg-black/30 border border-white/5 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                </div>
             </div>

             <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1.5 block">Seats Available</label>
                <input type="number" value={editingRide.max_members} onChange={e => setEditingRide({...editingRide, max_members: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/5 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50" />
             </div>
           </div>

           {/* Action Area */}
           <div className="pt-4 space-y-3">
              <button 
                disabled={isSaving}
                onClick={onSave}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isSaving ? 'SYNCING...' : 'SYNC CHANGES'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
