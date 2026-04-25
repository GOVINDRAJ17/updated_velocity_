import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Search, Activity, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useRides } from '../contexts/RideContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { getBestTimeToLeave, getTrafficLevel, getTrafficColor, getTrafficDot, isFillingFast } from '../lib/insights';


// Fix Leaflet's default icon issue with React
import 'leaflet/dist/leaflet.css';

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Premium Custom Marker
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg fill="none" viewBox="0 0 24 24" stroke="white" width="16" height="16">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Abstracted Map Relocator
function LocationUpdater({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 14, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
}

import { IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Maps() {
  const navigate = useNavigate();
  const { allRides, myRides, isLoading, refreshRides, joinRide, getRideStatus } = useRides();
  const { success, error } = useToast();
  const [isJoiningLocal, setIsJoiningLocal] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const traffic = getTrafficLevel();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
  }, []);

  // Caching & Permissions State
  const [center, setCenter] = useState<[number, number]>(() => {
    const cached = localStorage.getItem('velocity_last_center');
    return cached ? JSON.parse(cached) : [19.0760, 72.8777];
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  
  useEffect(() => {
    localStorage.setItem('velocity_last_center', JSON.stringify(center));
  }, [center]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPin, setSearchPin] = useState<[number, number] | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 1000); // 1s debounce for external API
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Geocoding via Nominatim
  useEffect(() => {
    if (!debouncedSearch) {
       setSearchPin(null);
       return;
    }
    
    const geocode = async () => {
       try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearch)}`);
          const data = await res.json();
          if (data && data.length > 0) {
             const lat = parseFloat(data[0].lat);
             const lon = parseFloat(data[0].lon);
             setSearchPin([lat, lon]);
             setCenter([lat, lon]);
          }
       } catch (err) {
          console.error("Geocoding failed", err);
       }
    };
    
    geocode();
  }, [debouncedSearch]);

  // Filter rides and inject dummy coordinates if missing for map demo
  const displayRides = allRides
    .filter(r => r.status === 'active' || r.status === 'upcoming')
    .filter(ride => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      const titleMatch = (ride.title || '').toLowerCase().includes(q);
      const startMatch = (ride.start_location || '').toLowerCase().includes(q);
      const endMatch = (ride.end_location || '').toLowerCase().includes(q);
      return titleMatch || startMatch || endMatch;
    });

  const handleJoinAction = async (rideId: string) => {
    setIsJoiningLocal(rideId);
    const res = await joinRide(rideId);
    if (res.success) {
      success('Formation joined! Redirecting to Live Room...');
      setTimeout(() => { navigate('/rideroom'); }, 1200);
    } else {
      error(res.error || 'System integrity error.');
    }
    setIsJoiningLocal(null);
  };

  const locateUser = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          success("Coordinates Locked");
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (error.code === 1) {
            setLocationError("PERMISSION_DENIED");
          } else {
            setLocationError("POSITION_UNAVAILABLE");
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationError("NOT_SUPPORTED");
    }
  };

  const handleCardScroll = (e: any) => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 300; // Approximate width of a card + gap
    const newIndex = Math.max(0, Math.round(scrollLeft / cardWidth));
    
    if (newIndex !== activeCardIndex && displayRides[newIndex]) {
      setActiveCardIndex(newIndex);
      const targetRide = displayRides[newIndex];
      if (targetRide.coordinates) {
        setCenter([targetRide.coordinates[0], targetRide.coordinates[1]]);
      }
    }
  };

  const selectMarker = (index: number) => {
    setActiveCardIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * 300,
        behavior: 'smooth'
      });
    }
    const targetRide = displayRides[index];
    if (targetRide) {
      const lat = targetRide.start_lat || 19.0760;
      const lng = targetRide.start_lng || 72.8777;
      setCenter([lat, lng]);
    }
  };

  return (
    <div className="bg-[#0B0F19] text-white min-h-screen relative overflow-hidden pb-16">
      {/* Map Container - Fullscreen Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          zoomControl={false}
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Premium Dark Map Layer
          />
          <LocationUpdater coords={center} />

          {/* Render Route Polyline for Selected Ride */}
          {displayRides[activeCardIndex] && displayRides[activeCardIndex].start_lat && (
            <Polyline 
              positions={[
                [displayRides[activeCardIndex].start_lat, displayRides[activeCardIndex].start_lng],
                [displayRides[activeCardIndex].end_lat, displayRides[activeCardIndex].end_lng]
              ]}
              color="#3B82F6"
              weight={3}
              opacity={0.6}
              dashArray="10, 15"
            />
          )}

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            showCoverageOnHover={false}
          >
            {displayRides.map((ride, index) => {
               const isSelected = activeCardIndex === index;
               const pos: [number, number] = [ride.start_lat || center[0], ride.start_lng || center[1]];
               
               return (
                 <Marker 
                   position={pos} 
                   key={ride.id + index} 
                   icon={createCustomIcon(isSelected ? '#10B981' : '#3B82F6')}
                   eventHandlers={{
                     click: () => selectMarker(index)
                   }}
                 >
                   {isSelected && (
                     <Popup className="premium-popup">
                       <div className="font-bold text-slate-800">{ride.title}</div>
                       <div className="text-xs text-blue-600 font-semibold">{ride.participants?.length || 0} Riders</div>
                     </Popup>
                   )}
                 </Marker>
               );
            })}
          </MarkerClusterGroup>

          {/* Dynamic Search Marker */}
          {searchPin && (
            <Marker 
              position={searchPin} 
              icon={createCustomIcon('#F59E0B')} // Orange Pin for Search
            >
              <Popup className="premium-popup">
                <div className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Search Result</div>
              </Popup>
            </Marker>
          )}

        </MapContainer>
        {/* Permission Error UI Overlay */}
        {locationError && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in">
             <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-xs shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                   <MapPin className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="font-bold text-xl mb-2">Location Restricted</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {locationError === 'PERMISSION_DENIED' 
                    ? "Velocity needs GPS access to track signatures and provide routing." 
                    : "Signal lost. Check your device location settings."}
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={locateUser} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-sm">Retry Connection</button>
                  <button onClick={() => setLocationError(null)} className="w-full py-3 bg-white/5 rounded-xl font-bold text-sm text-slate-400">View Map Only</button>
                </div>
             </div>
          </div>
        )}
        {/* Soft overlay gradient safely fading map */}
        <div className="absolute inset-x-0 bottom-0 top-auto h-96 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Floating Top Search UI */}
      <div className="absolute top-0 left-0 right-0 z-20 p-5 pointer-events-none">
        <div className="relative pointer-events-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search map coordinates or routes..."
            className="w-full pl-12 pr-4 py-3.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[1.5rem] text-white placeholder-slate-400 focus:border-blue-500/50 outline-none shadow-2xl"
          />
        </div>
      </div>

      {/* Current Location Button */}
      <button 
        onClick={locateUser}
        className="absolute bottom-64 right-5 bg-black/50 backdrop-blur-xl p-4 rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20 shadow-2xl active:scale-95 text-white"
      >
        <Navigation className="w-5 h-5 text-blue-400" />
      </button>

      {/* Floating Horizontal Cards Deck */}
      <div className="absolute bottom-24 left-0 right-0 z-30 pointer-events-none">
        {isLoading ? (
          <div className="px-5 text-sm font-bold animate-pulse text-blue-400 flex justify-center items-center gap-2">
             <Activity className="w-4 h-4"/> Syncing Sattelites...
          </div>
        ) : displayRides.length === 0 ? (
          <div className="px-5">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] text-center pointer-events-auto text-slate-300 font-medium">
               No active signatures directly matching your filters.
            </div>
          </div>
        ) : (
          <div 
            ref={scrollRef}
            onScroll={handleCardScroll}
            className="flex gap-4 overflow-x-auto px-5 pb-6 pt-2 snap-x snap-mandatory no-scrollbar pointer-events-auto shadow-2xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayRides.map((ride, i) => {
              const status = getRideStatus(ride);
              const isJoined = ride.participants?.some((p: any) => p.user_id === session?.user?.id);
              const isDriver = ride.driver_id === session?.user?.id;
              
              return (
              <div 
                key={ride.id} 
                className={`min-w-[280px] md:min-w-[320px] snap-center rounded-[2rem] overflow-hidden transition-all duration-300 border cursor-pointer ${activeCardIndex === i ? 'bg-gradient-to-br from-blue-900/80 to-indigo-900/60 border-blue-400/50 scale-100 shadow-[0_10px_40px_rgba(59,130,246,0.3)]' : 'bg-black/60 border-white/10 scale-95 opacity-80 backdrop-blur-md relative'}`}
                onClick={() => selectMarker(i)}
              >
                {status === 'past' && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20 flex items-center justify-center font-black uppercase tracking-[0.3em] text-slate-500 text-[10px] rotate-[-5deg] border-2 border-slate-500/20 m-6 rounded-2xl pointer-events-none">Expired</div>}
                {status === 'active' && activeCardIndex === i && <div className="absolute inset-0 rounded-[2rem] animate-pulse-glow pointer-events-none" />}
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'past' ? 'bg-slate-500/10 text-slate-500 border-slate-700' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'}`}>
                      {status === 'active' ? '● Active' : status}
                    </div>
                    <div className="text-xs font-black text-slate-400">{ride.distance || '—'}</div>
                  </div>
                  
                  <h3 className="font-black text-xl leading-none mb-1 tracking-tight">{ride.title}</h3>
                  <div className="text-[11px] font-bold text-slate-400 mb-4 flex items-center gap-1 uppercase tracking-wider">
                     <MapPin className="w-3 h-3 text-blue-400"/> {ride.start_location || ride.route?.split('to')[0] || 'Origin'}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                       <img src={ride.driver?.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=50&h=50&fit=crop'} alt="driver" className="w-6 h-6 rounded-full border border-[#0B0F19] bg-black object-cover"/>
                       <span className="text-[11px] font-bold text-slate-300">{ride.driver?.full_name || 'Ghost'}</span>
                    </div>
                    {isJoined || isDriver ? (
                      <button 
                        onClick={() => navigate('/rideroom')}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-900/20"
                      >
                         Enter Room <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : status === 'past' ? (
                      <button 
                        disabled 
                        className="bg-white/5 border border-white/5 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-50"
                      >
                         Expired
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleJoinAction(ride.id); }}
                        disabled={isJoiningLocal === ride.id}
                        className={`bg-white text-blue-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isJoiningLocal === ride.id ? 'opacity-50 font-medium' : 'active:scale-95'}`}
                      >
                         {isJoiningLocal === ride.id ? 'Syncing...' : 'Join Route'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

    </div>
  );
}
