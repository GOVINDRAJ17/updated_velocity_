import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { useRides } from './RideContext';

interface LiveRoomContextType {
  socket: Socket | null;
  liveKitToken: string;
  messages: any[];
  sendMessage: (message: string) => void;
  activeRide: any;
  leaveRide: () => void;
  currentUser: any;
}

const LiveRoomContext = createContext<LiveRoomContextType | undefined>(undefined);

export function LiveRoomProvider({ children }: { children: ReactNode }) {
  const { myRides, isLoading: isRidesLoading, refreshRides } = useRides();
  
  // Find the first active or upcoming ride to use for the room
  const activeRide = myRides.find(r => r.status === 'active' || r.status === 'upcoming');

  const [session, setSession] = useState<any>(null);
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeRide || !session?.user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setLiveKitToken('');
      return;
    }

    const roomId = activeRide.id;
    const userName = session.user.user_metadata?.full_name || 'Rider';

    // Establish persistent socket
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.emit('join-ride', roomId, { id: session.user.id, name: userName });

    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('user-joined', (data) => {
      setMessages(prev => [...prev, { system: true, text: `${data.user.name} joined the frequency` }]);
    });

    newSocket.on('user-left', (data) => {
      setMessages(prev => [...prev, { system: true, text: `${data.user.name} dropped connection` }]);
    });

    // Fetch token for LiveKit
    const fetchToken = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomId, participantName: userName })
        });
        const data = await res.json();
        if (data.token) {
          setLiveKitToken(data.token);
        }
      } catch (err) {
        console.warn("LiveKit token fetch failed:", err);
      }
    };
    fetchToken();

    return () => {
      newSocket.emit('leave-ride', roomId, { id: session.user.id, name: userName });
      newSocket.disconnect();
    };
  }, [activeRide?.id, session?.user?.id]);

  const sendMessage = (message: string) => {
    if (!socket || !message.trim() || !activeRide || !session?.user) return;
    
    socket.emit('send-message', {
      roomId: activeRide.id,
      message: message.trim(),
      user: { id: session.user.id, name: session.user.user_metadata?.full_name || 'Rider' }
    });
  };

  const leaveRide = async () => {
    if (!activeRide) return;
    try {
      if (socket) {
        socket.emit('leave-ride', activeRide.id, { id: session?.user?.id, name: session?.user?.user_metadata?.full_name });
        socket.disconnect();
        setSocket(null);
      }
      setLiveKitToken('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LiveRoomContext.Provider value={{ socket, liveKitToken, messages, sendMessage, activeRide, leaveRide, currentUser: session?.user }}>
      {children}
    </LiveRoomContext.Provider>
  );
}

export function useLiveRoom() {
  const context = useContext(LiveRoomContext);
  if (context === undefined) {
    throw new Error('useLiveRoom must be used within a LiveRoomProvider');
  }
  return context;
}
