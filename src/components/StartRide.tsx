import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Plus, ChevronLeft, Navigation, Clock, Activity, Target, CheckCircle, Copy, Check, Share2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRides } from '../contexts/RideContext';
import { LocationInput, Location } from './LocationInput';
import { RoutePreviewMap } from './RoutePreviewMap';
import { useToast } from '../contexts/ToastContext';
import { getWhatsAppShareUrl } from '../lib/insights';

import { useNavigate } from 'react-router-dom';

export function StartRide() {
  const navigate = useNavigate();
  type Tab = 'calendar' | 'solo';
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRideData, setCreatedRideData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { allRides, refreshRides, isLoading: isRidesLoading, joinRide, getRideStatus } = useRides();
  const { success: toastSuccess, error: toastError, toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState(false);
  const [isJoiningLocal, setIsJoiningLocal] = useState<string | null>(null);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    const length = 6 + Math.floor(Math.random() * 3); // 6-8 chars
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Forms
  const [soloStart, setSoloStart] = useState('');
  const [soloDest, setSoloDest] = useState('');
  
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', 
    ride_date: selectedDate, 
    ride_time: '08:00',
    end_date: selectedDate,
    end_time: '12:00',
    max_members: 10, 
    distance: 'TBD', 
    description: ''
  });

  const [startPoint, setStartPoint] = useState<Location | null>(null);
  const [endPoint, setEndPoint] = useState<Location | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    if (startPoint && endPoint) {
      calculateDistance();
    }
  }, [startPoint, endPoint]);

  const calculateDistance = async () => {
    if (!startPoint || !endPoint) return;
    setIsCalculatingDistance(true);
    setDistanceError(false);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=false`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const dist = (data.routes[0].distance / 1000).toFixed(1);
        setFormData(prev => ({ ...prev, distance: dist + ' km' }));
      } else {
        throw new Error('No route');
      }
    } catch (err) {
      console.error("OSRM error", err);
      setDistanceError(true);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const scheduledRides = allRides.filter(ride => 
    ride.ride_date === selectedDate && 
    (ride.status === 'upcoming' || ride.status === 'active')
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast("Please log in to create a ride.", "error");
      return;
    }

    if (!startPoint || !endPoint) {
      toast("Please select valid locations from the suggestions.", "error");
      return;
    }

    try {
      setIsLoading(true);
      
      // Unified Timestamps
      const startDateTime = new Date(`${formData.ride_date}T${formData.ride_time}`).toISOString();
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`).toISOString();

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast("Expedition end time must be after the start time.", "error");
        return;
      }

      // Access Code Generation
      let accessCode = generateAccessCode();
      const isUnique = !allRides.some(r => r.access_code?.toUpperCase() === accessCode);
      if (!isUnique) {
          accessCode = generateAccessCode(); 
      }

      // Distance Format
      const sanitizedDistance = formData.distance.toLowerCase().includes('km') 
        ? formData.distance.toLowerCase().replace('kms', 'km').trim() 
        : `${formData.distance.trim()} km`;

      const { error, data } = await supabase.from('rides').insert([{
        driver_id: session.user.id,
        title: formData.title,
        start_location: startPoint.name,
        end_location: endPoint.name,
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        route: `${startPoint.name.split(',')[0]} to ${endPoint.name.split(',')[0]}`,
        ride_date: formData.ride_date,
        ride_time: formData.ride_time + ':00',
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        max_members: formData.max_members,
        distance: sanitizedDistance,
        status: 'upcoming',
        access_code: accessCode
      }]).select();

      if (error) throw error;
      
      await refreshRides();
      const rideForShare = data?.[0];

      setCreatedRideData({
        title: formData.title,
        start_location: startPoint.name.split(',')[0],
        end_location: endPoint.name.split(',')[0],
        ride_date: formData.ride_date,
        ride_time: formData.ride_time,
        access_code: accessCode,
        distance: sanitizedDistance,
        ...(rideForShare || {})
      });
      setShowSuccess(true);
      setShowCreateForm(false);
    } catch (err: any) {
      toastError('Error creating ride: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SOLO MAP PUSH ---
  const launchSoloRide = () => {
    if (!startPoint || !endPoint) {
      toastError('Please select valid locations from the suggestions.');
      return;
    }
    setShowPreview(true);
  };

  // --- CALENDAR RENDER ---
  const renderCalendarRow = () => {
    const dates = [];
    const today = new Date();
    for (let i = -1; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {dates.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[4rem] py-3 rounded-2xl transition-all ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/50' 
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`text-[10px] uppercase tracking-wider mb-1 ${isSelected ? 'text-blue-200' : ''}`}>
                {isToday ? 'Today' : days[date.getDay()]}
              </div>
              <div className="text-xl font-black">{date.getDate()}</div>
            </button>
          );
        })}
      </div>
    );
  };

  // --- SUCCESS VIEW ---
  if (showSuccess) {
    const whatsappUrl = getWhatsAppShareUrl(createdRideData || {});
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center p-5 relative">
          {/* Subtle ambient glow — matches app design language */}
          <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/8 blur-[80px] rounded-full pointer-events-none" />

        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-float">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute inset-0 rounded-full animate-pulse-glow" />
        </div>

        <h2 className="text-3xl font-black mb-2 tracking-tight text-center">Formation Created!</h2>
        <p className="text-slate-400 text-center mb-10 max-w-xs text-sm leading-relaxed">
          Your ride is live on the Velocity network. Share the access code below.
        </p>
        
        {/* Ride Card */}
        <div className="w-full max-w-sm bg-gradient-to-br from-[#1A1F2E] to-[#0B0F19] border border-white/10 rounded-[2.5rem] p-6 mb-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Formation Details</div>
          <div className="font-black text-xl mb-1">{createdRideData?.title}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-5">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            {createdRideData?.start_location} ➔ {createdRideData?.end_location}
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/5 mb-5">
            <div className="flex-1 text-center">
              <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Date</div>
              <div className="text-xs font-bold">{createdRideData?.ride_date}</div>
            </div>
            <div className="flex-1 text-center border-l border-white/5">
              <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Time</div>
              <div className="text-xs font-bold">{createdRideData?.ride_time}</div>
            </div>
            {createdRideData?.distance && (
              <div className="flex-1 text-center border-l border-white/5">
                <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Distance</div>
                <div className="text-xs font-bold">{createdRideData.distance}</div>
              </div>
            )}
          </div>

          {/* Access Code */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 text-center">🔑 Security Access Code</div>
            <div className="flex items-center gap-2 p-3 bg-black/30 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
              <div className="flex-1 text-xl font-black text-center tracking-[0.35em] font-mono text-blue-400 uppercase">
                {createdRideData?.access_code}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(createdRideData?.access_code);
                  setCopied(true);
                  toast('Access code copied!', 'success');
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all press-effect"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-2 uppercase font-bold tracking-tighter">
              Share this code with riders to join the formation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press-effect w-full py-4 bg-[#25D366] text-white rounded-2xl font-black tracking-widest text-[11px] uppercase shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share via WhatsApp
          </a>
          <button 
            onClick={() => { setShowSuccess(false); setActiveTab('calendar'); }} 
            className="press-effect w-full py-4 bg-white text-slate-900 rounded-2xl font-black tracking-widest text-[11px] uppercase shadow-lg"
          >
            Manage Rides
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="press-effect w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black tracking-widest text-[11px] uppercase text-slate-300"
          >
            Go to Home
          </button>
        </div>
        </div>
      </div>
    );
  }

  // --- CREATE FORM VIEW ---
  if (showCreateForm) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0B0F19] text-white p-5 animate-in slide-in-from-right relative z-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-900/5 backdrop-blur-[2px] pointer-events-none"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowCreateForm(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black tracking-tight">Create Group Ride</h2>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 space-y-5 shadow-inner">
              <div>
                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">Ride Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50" placeholder="Weekend Lonavala Run" />
              </div>
              
              <LocationInput 
                label="Start Point" 
                placeholder="Where are you starting?" 
                icon={<MapPin className="w-4 h-4 text-blue-500" />}
                onSelect={setStartPoint}
                required
              />

              <LocationInput 
                label="Destination" 
                placeholder="Where are you heading?" 
                icon={<Target className="w-4 h-4 text-green-500" />}
                onSelect={setEndPoint}
                required
              />

              {(startPoint && endPoint) && (
                <button 
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="w-full py-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" /> Preview Route
                </button>
              )}
            </div>

            <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 grid grid-cols-2 gap-x-4 gap-y-5 shadow-inner">
              <div className="col-span-2">
                <h4 className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] mb-2 px-2">Departure Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">Start Date</label>
                    <input required type="date" value={formData.ride_date} onChange={e => setFormData({...formData, ride_date: e.target.value})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">Start Time</label>
                    <input required type="time" value={formData.ride_time} onChange={e => setFormData({...formData, ride_time: e.target.value})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h4 className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-2 px-2">Completion Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">End Date</label>
                    <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">End Time</label>
                    <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 mt-2">
                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">Total Seats</label>
                <input required type="number" min="1" max="100" value={formData.max_members} onChange={e => setFormData({...formData, max_members: parseInt(e.target.value)})} className="w-full mt-1.5 bg-black/30 border border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50" />
              </div>
              
              <div className="pt-2 border-t border-white/5 mt-2">
                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">Est. Distance</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.distance} 
                    onChange={e => setFormData({...formData, distance: e.target.value})} 
                    className={`w-full mt-1.5 bg-black/30 border rounded-2xl px-4 py-3 outline-none focus:border-blue-500/50 pr-10 ${isCalculatingDistance ? 'opacity-50' : ''}`} 
                    placeholder="Calculating..." 
                  />
                  {isCalculatingDistance && (
                    <div className="absolute right-3 top-1/2 translate-y-[-2px]">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {distanceError && (
                    <button type="button" onClick={calculateDistance} className="absolute right-3 top-1/2 translate-y-[-2px] text-[9px] font-black text-blue-500 uppercase">Retry</button>
                  )}
                </div>
                {!isCalculatingDistance && !distanceError && formData.distance !== 'TBD' && (
                  <div className="text-[9px] font-bold text-blue-400/60 mt-1 ml-2 uppercase italic tracking-tighter">Estimated via road</div>
                )}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black tracking-wide text-white shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-transform">
              {isLoading ? 'CREATING...' : 'PUBLISH RIDE'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN START VIEW ---
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative">
      <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-blue-900/20 to-[#0B0F19] pointer-events-none"></div>
      
      <div className="max-w-lg mx-auto p-5 relative z-10 pt-8 pb-32">
        <h1 className="text-3xl font-black mb-6 tracking-tight">Let's Ride</h1>
        
        {/* Nav Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 shadow-inner">
          <button onClick={() => setActiveTab('calendar')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'calendar' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white' : 'text-slate-400'}`}>
            <CalendarIcon className="w-4 h-4"/> Groups
          </button>
          <button onClick={() => setActiveTab('solo')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'solo' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white' : 'text-slate-400'}`}>
            <Navigation className="w-4 h-4"/> Solo Check-in
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400"/> Schedule Filter</h2>
            {renderCalendarRow()}
            
            <div className="mt-8 space-y-4">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Activities on {selectedDate}</h2>
              {isRidesLoading ? (
                <div className="text-slate-500 text-sm font-medium py-10 text-center animate-pulse">Scanning database...</div>
              ) : scheduledRides.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center shadow-inner">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <div className="text-slate-400 font-medium">No rides mapped for this day.</div>
                  <button onClick={() => setShowCreateForm(true)} className="mt-4 text-blue-400 text-sm font-bold border border-blue-500/30 px-6 py-2 rounded-full hover:bg-blue-500/10 transition-colors">Be the first</button>
                </div>
              ) : (
                scheduledRides.map((ride, i) => {
                  const status = getRideStatus(ride);
                  const isJoined = ride.participants?.some((p: any) => p.user_id === session?.user?.id);
                  const isDriver = ride.driver_id === session?.user?.id;
                  
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-colors shadow-lg backdrop-blur-md relative overflow-hidden group">
                      {status === 'past' && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center font-black uppercase tracking-[0.3em] text-slate-500 text-[10px] rotate-[-5deg] border-2 border-slate-500/20 m-4 rounded-2xl pointer-events-none">Expired</div>}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {ride.ride_time.substring(0,5)} HOURS • {status}
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300">{ride.distance}</div>
                      </div>
                      
                      <div className="font-bold text-xl mb-1">{ride.title}</div>
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2 mb-5">
                        <MapPin className="w-3 h-3 text-blue-500"/> {ride.start_location?.split(',')[0]} → {ride.end_location?.split(',')[0]}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-600"/>
                          {ride.max_members - (ride.participants?.length || 0)} SLOTS LEFT
                        </div>
                        
                        {(isJoined || isDriver) ? (
                          <button className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-default">
                             Joined
                          </button>
                        ) : status === 'past' ? (
                          <button disabled className="bg-white/5 border border-white/5 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-50">
                             Expired
                          </button>
                        ) : (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              setIsJoiningLocal(ride.id);
                              const res = await joinRide(ride.id);
                              if (res.success) {
                                toast('Successfully joined the formation!', 'success');
                              } else {
                                toast(res.error || 'Failed to join', 'error');
                              }
                              setIsJoiningLocal(null);
                            }}
                            disabled={isJoiningLocal === ride.id}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
                          >
                            {isJoiningLocal === ride.id ? 'Syncing...' : 'Join Ride'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Floating Action Button for Creation */}
            <button 
              onClick={() => setShowCreateForm(true)}
              className="fixed bottom-24 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-[0_8px_30px_rgba(59,130,246,0.5)] border border-blue-400/50 hover:scale-110 active:scale-95 transition-all z-20 group"
            >
              <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        )}

        {activeTab === 'solo' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 text-center mb-6">
                <Navigation className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <h2 className="text-lg font-black tracking-tight mb-2">Solo Recon Protocol</h2>
                <p className="text-sm font-medium text-blue-200/70">Enter your coordinates. Real-time mapping and routing lines will be deployed.</p>
             </div>              <div className="space-y-5 bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-inner">
                 <LocationInput 
                    label="Current Origin" 
                    placeholder="Search start point..." 
                    icon={<MapPin className="w-4 h-4 text-blue-500" />}
                    onSelect={setStartPoint}
                 />
                 <LocationInput 
                    label="Final Objective" 
                    placeholder="Search destination..." 
                    icon={<Target className="w-4 h-4 text-green-500" />}
                    onSelect={setEndPoint}
                 />
                 
                 <button onClick={launchSoloRide} className="w-full mt-2 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black tracking-widest transition-all shadow-lg active:scale-95">
                   CALCULATE VECTOR
                 </button>
              </div>
           </div>
        )}

        {showPreview && startPoint && endPoint && (
          <RoutePreviewMap 
            start={startPoint} 
            end={endPoint} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </div>
    </div>
  );
}
