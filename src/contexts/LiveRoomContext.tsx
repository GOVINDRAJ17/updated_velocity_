import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useRides } from './RideContext';

interface LiveRoomContextType {
  liveKitToken: string;
  messages: any[];
  sendMessage: (message: string) => Promise<void>;
  activeRide: any;
  leaveRide: () => void;
  currentUser: any;
}

const LiveRoomContext = createContext<LiveRoomContextType | undefined>(undefined);

export function LiveRoomProvider({ children }: { children: ReactNode }) {
  const { myRides } = useRides();
  
  // Find the first active or upcoming ride to use for the room
  const activeRide = myRides.find(r => r.status === 'active' || r.status === 'upcoming');

  const [session, setSession] = useState<any>(null);
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeRide || !session?.user) {
      setLiveKitToken('');
      setMessages([]);
      return;
    }

    const roomId = activeRide.id;
    const userName = session.user.user_metadata?.full_name || 'Rider';

    // 1. Fetch historical messages for persistence
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('ride_id', roomId)
          .order('created_at', { ascending: true });
        
        if (data && !error) {
          const formatted = data.map(msg => ({
            id: msg.id,
            message: msg.content,
            user: { id: msg.user_id, name: msg.user_name },
            time: msg.created_at,
            system: msg.is_system
          }));
          setMessages(formatted);
        } else {
           console.warn("Could not fetch chat history, table may not exist yet.");
        }
      } catch (err) {
        console.warn("Error fetching history:", err);
      }
    };

    fetchHistory();

    // 2. Subscribe to new messages via Supabase Realtime
    const channel = supabase.channel(`ride_room_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', table: 'chat_messages', filter: `ride_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              message: newMsg.content,
              user: { id: newMsg.user_id, name: newMsg.user_name },
              time: newMsg.created_at,
              system: newMsg.is_system
            }];
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && !isSubscribed) {
          setIsSubscribed(true);
          // Insert system message for joining
          insertSystemMessage(roomId, `${userName} joined the frequency`);
        }
      });

    // 3. Fetch token for LiveKit (optional voice)
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
      if (isSubscribed) {
        insertSystemMessage(roomId, `${userName} dropped connection`);
      }
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [activeRide?.id, session?.user?.id]);

  const insertSystemMessage = async (rideId: string, text: string) => {
    try {
      await supabase.from('chat_messages').insert({
        ride_id: rideId,
        content: text,
        user_id: session?.user?.id || null,
        user_name: 'SYSTEM',
        is_system: true
      });
    } catch (e) {
      // Ignore if table doesn't exist
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !activeRide || !session?.user) return;
    
    const newMsg = {
      ride_id: activeRide.id,
      content: message.trim(),
      user_id: session.user.id,
      user_name: session.user.user_metadata?.full_name || 'Rider',
      is_system: false
    };

    try {
      const { error } = await supabase.from('chat_messages').insert(newMsg);
      if (error) {
        console.error("Failed to send message:", error);
        // Fallback: update local state if table missing
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          message: newMsg.content,
          user: { id: newMsg.user_id, name: newMsg.user_name },
          time: new Date().toISOString(),
          system: false
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const leaveRide = async () => {
    if (!activeRide) return;
    setLiveKitToken('');
  };

  return (
    <LiveRoomContext.Provider value={{ liveKitToken, messages, sendMessage, activeRide, leaveRide, currentUser: session?.user }}>
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
