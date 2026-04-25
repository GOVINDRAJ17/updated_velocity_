import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface LocationInputProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  initialValue?: string;
  onSelect: (location: Location) => void;
  required?: boolean;
}

export function LocationInput({ label, placeholder, icon, initialValue = '', onSelect, required = false }: LocationInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(initialValue !== '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (val: string) => {
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsSelected(false);
    setIsOpen(true);
    
    // Simple debounce
    const timeout = setTimeout(() => searchLocations(val), 500);
    return () => clearTimeout(timeout);
  };

  const handleSelect = (s: any) => {
    const loc: Location = {
      name: s.display_name,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon)
    };
    setQuery(loc.name);
    setIsSelected(true);
    setIsOpen(false);
    onSelect(loc);
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setIsSelected(false);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 pl-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isLoading ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : icon}
        </div>
        <input 
          required={required}
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          className={`w-full bg-black/30 border rounded-2xl pl-10 pr-10 py-3.5 outline-none transition-all ${
            isSelected ? 'border-green-500/30' : 'border-white/5 focus:border-blue-500/50'
          }`} 
          placeholder={placeholder} 
        />
        {query && (
          <button onClick={clearInput} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121624] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-200 line-clamp-1">{s.display_name.split(',')[0]}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{s.display_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
