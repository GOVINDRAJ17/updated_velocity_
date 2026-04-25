import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Users, MapPin, Gauge, Clock, Square, Pause, Play, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useWalkieTalkie } from '../contexts/WalkieTalkieContext';
import { supabase } from '../lib/supabase';
import { Geolocation } from '@capacitor/geolocation';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { registerPlugin } from '@capacitor/core';
const BackgroundGeolocation = registerPlugin<any>('BackgroundGeolocation');

interface LiveGroupRideProps {
  ride: any;
  isSolo: boolean;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface RiderLocation {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lng: number;
  distance: number;
}

export function LiveGroupRide({ ride, isSolo, onComplete, onBack }: LiveGroupRideProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [riders, setRiders] = useState<RiderLocation[]>([]);
  
  const { mode, timerDuration } = useWalkieTalkie();
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load participants for group rides
  useEffect(() => {
    if (!isSolo && ride?.id) {
       // Ideally fetch participants dynamically from Supabase
       // For UI stability pending cloud setup, adding a mock fallback
       setRiders([{
         id: '1', name: 'You (Driver)', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop', lat: 19.07, lng: 72.87, distance: 0
       }]);
    }
  }, [ride, isSolo]);

  // Realistic speed and distance tracking via Native Geolocation
  useEffect(() => {
    if (!isStarted || isPaused) {
      setCurrentSpeed(0);
      return;
    }

    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    let watcherId: string;
    let lastLat: number | null = null;
    let lastLng: number | null = null;

    const startTracking = async () => {
      try {
        await Geolocation.requestPermissions();
        // Fallback or explicit request
        watcherId = await BackgroundGeolocation.addWatcher(
          {
            requestPermissions: true,
            stale: false,
            distanceFilter: 1 // Track every 1 meter
          },
          (location: any, error: any) => {
            if (error || !location) return;

            // Update Current Speed (m/s to km/h)
            if (location.speed != null && location.speed > 0) {
              setCurrentSpeed(location.speed * 3.6);
            }

            // Haversine distance increment
            if (lastLat !== null && lastLng !== null) {
              const R = 6371; // Earth's radius in km
              const dLat = (location.latitude - lastLat) * Math.PI / 180;
              const dLon = (location.longitude - lastLng) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lastLat * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const d = R * c; 
              if (d > 0.001) { // 1 meter deadzone filter
                setDistance(prev => prev + d);
              }
            }
            lastLat = location.latitude;
            lastLng = location.longitude;
          }
        );
      } catch (e) {
        console.warn("Native geolocation error, perhaps running in browser wrapper", e);
      }
    };
    
    startTracking();

    return () => {
      clearInterval(interval);
      if (watcherId) {
        BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(console.error);
      }
    };
  }, [isStarted, isPaused]);

  // Timer for push-to-talk
  useEffect(() => {
    if (mode === 'push-timer' && isTalking && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setIsTalking(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isTalking, timerRemaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMicPress = async () => {
    if (mode === 'hold') return;
    
    try {
      await VoiceRecorder.requestAudioRecordingPermission();
    } catch (e) {
      console.warn("Native microphone permission skipped in browser", e);
    }
    
    if (mode === 'push-manual') {
      if (!isTalking) {
        setIsTalking(true);
        try { await VoiceRecorder.startRecording(); } catch(e){}
      } else {
        setIsTalking(false);
        try {
          const result = await VoiceRecorder.stopRecording();
          console.log("Audio ready to broadcast (base64 length):", result.value?.recordDataBase64?.length);
        } catch(e){}
      }
    }
    
    if (mode === 'push-timer') {
      if (!isTalking) {
        setIsTalking(true);
        setTimerRemaining(timerDuration);
        try { await VoiceRecorder.startRecording(); } catch(e){}
      } else {
        setIsTalking(false);
        setTimerRemaining(0);
        try { await VoiceRecorder.stopRecording(); } catch(e){}
      }
    }
  };

  const handleFinish = async () => {
    if (confirm('End this ride?')) {
      const avgSpeed = time > 0 ? (distance / (time / 3600)) : 0;
      const rideData = {
        distance: distance.toFixed(2),
        duration: formatTime(time),
        avgSpeed: avgSpeed.toFixed(1),
        maxSpeed: '65.4',
        elevation: '240',
        calories: Math.floor(distance * 35).toString(),
        rideName: isSolo ? 'Solo Ride' : ride?.title || 'Group Ride',
      };

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isSolo) {
            // Save newly tracked solo ride history
            const { data: newRide, error: rideError } = await supabase.from('rides').insert([{
              driver_id: session.user.id,
              title: 'Solo Ride - ' + new Date().toLocaleDateString(),
              distance: rideData.distance + ' km',
              ride_date: new Date().toISOString().split('T')[0],
              status: 'completed'
            }]).select();

            if (!rideError && newRide?.[0]) {
              await supabase.from('ride_participants').insert([{
                ride_id: newRide[0].id,
                user_id: session.user.id
              }]);
              
              // Increment profile stats
              const { data: profile } = await supabase.from('profiles').select('total_distance, routes_completed, total_time').eq('id', session.user.id).single();
              if (profile) {
                await supabase.from('profiles').update({
                  total_distance: (profile.total_distance || 0) + Math.floor(distance),
                  routes_completed: (profile.routes_completed || 0) + 1,
                  total_time: (profile.total_time || 0) + Math.floor(time / 3600)
                }).eq('id', session.user.id);
              }
            }
          } else if (ride?.id) {
             // For joined rides, maybe just mark participant as completed (requires a custom schema or RPC, keeping it simple here)
             // We can just increment profile stats
             const { data: profile } = await supabase.from('profiles').select('total_distance, routes_completed, total_time').eq('id', session.user.id).single();
             if (profile) {
               await supabase.from('profiles').update({
                 total_distance: (profile.total_distance || 0) + Math.floor(distance),
                 routes_completed: (profile.routes_completed || 0) + 1,
                 total_time: (profile.total_time || 0) + Math.floor(time / 3600)
               }).eq('id', session.user.id);
             }
          }
        }
      } catch (err) {
        console.error("Failed to sync ride history", err);
      }
      
      onComplete(rideData);
    }
  };

  if (!isStarted) {
    return (
      <div className="bg-slate-900 text-white min-h-screen">
        <div className="sticky top-14 bg-slate-900 px-4 py-3 flex items-center gap-3 z-40">
          <button onClick={onBack} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold">{isSolo ? 'Solo Ride' : ride?.title}</h2>
            {!isSolo && <p className="text-sm text-slate-400">{ride?.groups?.name || 'Independent'}</p>}
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {!isSolo && (
            <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Riders Ready</h3>
                <span className="text-sm text-blue-400">{riders.length} online</span>
              </div>
              
              <div className="space-y-2">
                {riders.map((rider) => (
                  <div key={rider.id} className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-2xl">
                    <img src={rider.avatar} alt={rider.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-medium">{rider.name}</div>
                      <div className="text-xs text-green-400">● Online</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 h-64 flex items-center justify-center border border-slate-700">
            <MapPin className="w-16 h-16 text-blue-500" />
            <span className="ml-4 font-bold text-slate-300">GPS Ready</span>
          </div>

          <button
            onClick={() => setIsStarted(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-4 rounded-2xl font-semibold transition-all shadow-lg"
          >
            Start Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-900 text-white h-screen overflow-hidden">
      {/* Fallback Screen Map Background */}
      <div className="absolute inset-0 bg-slate-900 z-0 flex items-center justify-center">
        <MapPin className="w-24 h-24 text-slate-800 opacity-50" />
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-900/70 backdrop-blur-md rounded-3xl p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300">Speed</span>
            </div>
            <div className="text-3xl font-bold text-white">{currentSpeed.toFixed(1)}</div>
            <div className="text-xs text-slate-400">km/h</div>
          </div>

          <div className="flex-1 bg-slate-900/70 backdrop-blur-md rounded-3xl p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300">Distance</span>
            </div>
            <div className="text-3xl font-bold text-white">{distance.toFixed(2)}</div>
            <div className="text-xs text-slate-400">km</div>
          </div>

          <div className="flex-1 bg-slate-900/70 backdrop-blur-md rounded-3xl p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-300">Time</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{formatTime(time)}</div>
          </div>
        </div>
      </div>

      {!isSolo && showLocations && (
        <div className="absolute top-32 right-4 w-48 bg-slate-900/70 backdrop-blur-md rounded-3xl p-3 z-10 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-300">Locations</h3>
            <button onClick={() => setShowLocations(false)} className="p-1"><X className="w-3 h-3 text-slate-400" /></button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riders.map((rider) => (
              <div key={rider.id} className="flex items-center justify-between text-xs">
                <span className={rider.id === '1' ? 'text-blue-400 font-medium' : 'text-slate-300'}>{rider.name}</span>
                <span className="text-slate-500">{rider.distance === 0 ? 'Leader' : `+${rider.distance}km`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSolo && showMembers && (
        <div className="absolute top-32 left-4 w-48 bg-slate-900/70 backdrop-blur-md rounded-3xl p-3 z-10 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-300">Members</h3>
            <button onClick={() => setShowMembers(false)} className="p-1"><X className="w-3 h-3 text-slate-400" /></button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riders.map((rider) => (
              <div key={rider.id} className="flex items-center gap-2">
                <img src={rider.avatar} alt={rider.name} className="w-6 h-6 rounded-full object-cover" />
                <span className={`text-xs ${rider.id === '1' ? 'text-blue-400 font-medium' : 'text-slate-300'}`}>{rider.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle buttons */}
      {!isSolo && (
        <>
          {!showMembers && (
            <button onClick={() => setShowMembers(true)} className="absolute top-32 left-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-full z-10 shadow-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </button>
          )}
          {!showLocations && (
            <button onClick={() => setShowLocations(true)} className="absolute top-32 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-full z-10 shadow-lg">
              <MapPin className="w-5 h-5 text-blue-400" />
            </button>
          )}
        </>
      )}

      {/* Walkie Talkie */}
      {!isSolo && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleMicPress}
            onMouseDown={() => mode === 'hold' && setIsTalking(true)}
            onMouseUp={() => mode === 'hold' && setIsTalking(false)}
            onTouchStart={() => mode === 'hold' && setIsTalking(true)}
            onTouchEnd={() => mode === 'hold' && setIsTalking(false)}
            className={`relative px-8 py-8 rounded-full font-semibold transition-all shadow-2xl ${
              isTalking ? 'bg-green-600 scale-110' : 'bg-slate-900/80 backdrop-blur-md border border-green-500'
            }`}
          >
            {isTalking ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-green-400" />}
            {mode === 'push-timer' && isTalking && timerRemaining > 0 && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                {timerRemaining}
              </div>
            )}
          </button>
          <div className="mt-2 text-center text-xs text-slate-300 font-semibold drop-shadow-md">
            {mode === 'hold' && 'Hold to Talk'}
            {mode === 'push-manual' && (isTalking ? 'Transmitting...' : 'Push to Talk')}
            {mode === 'push-timer' && (isTalking ? `${timerRemaining}s remaining` : `Push to Talk (${timerDuration}s)`)}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-full bg-slate-900/80 backdrop-blur-md py-2 flex items-center justify-center gap-2 text-white font-medium border-t border-slate-700"
        >
          {showControls ? <ChevronDown className="w-5 h-5 text-blue-400" /> : <ChevronUp className="w-5 h-5 text-blue-400" />}
          {showControls ? 'Resume Focus' : 'Show Controls'}
        </button>

        {showControls && (
          <div className="bg-slate-900/95 backdrop-blur-xl p-4 border-t border-slate-700">
            <div className="flex gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isPaused ? 'bg-green-600' : 'bg-blue-600'
                }`}
              >
                {isPaused ? <><Play className="w-5 h-5" /> Resume</> : <><Pause className="w-5 h-5" /> Pause</>}
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Square className="w-5 h-5 fill-white" /> Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
