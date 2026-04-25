import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, PhoneOff, VolumeX, Volume2 } from 'lucide-react';

interface VoiceChannelProps {
  rideId: string;
}

export function VoiceChannel({ rideId }: VoiceChannelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const connectVoice = async () => {
    try {
      // STEP 2 - FRONTEND SOCKET SETUP
      socketRef.current = io('http://localhost:4000');
      
      // STEP 3 - GET USER AUDIO
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // STEP 4 - CREATE WebRTC CONNECTION
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // STEP 5 - ADD AUDIO TO CONNECTION
      stream.getTracks().forEach(track => {
        if (peerRef.current && localStreamRef.current) {
          peerRef.current.addTrack(track, localStreamRef.current);
        }
      });

      // STEP 8 - HANDLE ICE CANDIDATES
      peerRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("signal", {
            rideId,
            data: { candidate: event.candidate }
          });
        }
      };

      // STEP 9 - RECEIVE AUDIO FROM OTHERS
      peerRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(e => console.error("Audio play blocked", e));
        }
      };

      // STEP 6 - JOIN VOICE ROOM
      socketRef.current.emit("join_voice_room", rideId);
      setIsConnected(true);

      // STEP 7 - SIGNALING
      // 7a. User joined, create offer
      socketRef.current.on("user_joined_voice", async () => {
        if (!peerRef.current) return;
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current?.emit("signal", {
          rideId,
          data: { sdp: peerRef.current.localDescription }
        });
      });

      // 7b. Listen for signal
      socketRef.current.on("signal", async (data: any) => {
        if (!peerRef.current) return;
        
        if (data.sdp) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          
          if (data.sdp.type === "offer") {
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socketRef.current?.emit("signal", {
              rideId,
              data: { sdp: peerRef.current.localDescription }
            });
          }
        }

        if (data.candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

    } catch (err) {
      console.error("Voice connection failed:", err);
      alert("Microphone access denied or backend unreachable.");
    }
  };

  const disconnectVoice = () => {
    // STEP 11 - LEAVE VOICE
    if (socketRef.current) {
      socketRef.current.emit("leave_voice_room", rideId);
      socketRef.current.disconnect();
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      disconnectVoice();
    };
  }, []);

  // STEP 10 - MUTE / UNMUTE
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleDeafen = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsDeafened(remoteAudioRef.current.muted);
    }
  };

  return (
    <div className="bg-[#0B0F19] border-t border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
      
      {!isConnected ? (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voice Disconnected</span>
          </div>
          <button 
            onClick={connectVoice}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(5,150,105,0.4)] active:scale-95 transition-all"
          >
            Connect Voice
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ride Voice Connected</span>
            </div>
            <span className="text-[9px] font-bold text-slate-500">WebRTC Encrypted</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              onClick={toggleDeafen}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${isDeafened ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={disconnectVoice}
              className="p-2.5 rounded-xl transition-all active:scale-95 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
