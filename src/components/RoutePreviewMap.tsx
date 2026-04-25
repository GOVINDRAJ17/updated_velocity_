import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target, X, Navigation } from 'lucide-react';

interface RoutePreviewMapProps {
  start: { lat: number, lng: number, name: string };
  end: { lat: number, lng: number, name: string };
  onClose: () => void;
}

// Fix Leaflet's default icon issue
const startIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const endIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

function MapResizer({ start, end }: { start: [number, number], end: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [start, end, map]);
  return null;
}

export function RoutePreviewMap({ start, end, onClose }: RoutePreviewMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<string>('Calculating...');

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setRoute(coords);
          setDistance((data.routes[0].distance / 1000).toFixed(1) + ' km');
        } else {
          // Fallback to straight line
          setRoute([[start.lat, start.lng], [end.lat, end.lng]]);
          setDistance('Direct path');
        }
      } catch (err) {
        console.error("Routing failed", err);
        setRoute([[start.lat, start.lng], [end.lat, end.lng]]);
        setDistance('Direct path');
      }
    };

    fetchRoute();
  }, [start, end]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#101524] w-full max-w-2xl h-[80vh] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#101524]/80 backdrop-blur-md z-10">
          <div>
            <h3 className="font-black text-lg tracking-tight">Route Reconnaissance</h3>
            <div className="text-[10px] uppercase font-black tracking-widest text-blue-400 mt-0.5 flex items-center gap-1.5">
              <Navigation className="w-3 h-3"/> Active Navigation Path
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 active:scale-90 transition-all border border-white/10">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer 
            center={[start.lat, start.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapResizer start={[start.lat, start.lng]} end={[end.lat, end.lng]} />
            <Marker position={[start.lat, start.lng]} icon={startIcon} />
            <Marker position={[end.lat, end.lng]} icon={endIcon} />
            {route.length > 0 && (
              <Polyline 
                positions={route} 
                color="#3B82F6" 
                weight={4} 
                opacity={0.8}
                dashArray="8, 12"
              />
            )}
          </MapContainer>

          {/* Overlay Stats */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-2xl">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Est. Distance</div>
                <div className="text-xl font-black text-white">{distance}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Status</div>
                <div className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Path Locked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-blue-400"/>
              </div>
              <div>
                <div className="text-[9px] uppercase font-black text-slate-500">Departure</div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{start.name}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-green-400"/>
              </div>
              <div>
                <div className="text-[9px] uppercase font-black text-slate-500">Arrival</div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{end.name}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
