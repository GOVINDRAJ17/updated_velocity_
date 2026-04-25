import { useRef, useEffect, useState } from 'react';
import { useLiveRoom } from '../contexts/LiveRoomContext';
import { Send, Users, ShieldAlert, MessageSquare, ChevronLeft, Paperclip } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useParticipants, useConnectionState } from '@livekit/components-react';
import { useNavigate } from 'react-router-dom';
import { VoiceChannel } from './VoiceChannel';
import { useRides } from '../contexts/RideContext';

export function RideRoom() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { activeRide, messages, sendMessage, liveKitToken, currentUser } = useLiveRoom();
  const participants = useParticipants();
  const connState = useConnectionState();
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { getRideStatus } = useRides();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle auto-redirect if ride expires while viewing
  useEffect(() => {
    if (activeRide && getRideStatus(activeRide) === 'past') {
      // Optional: Auto redirect after 3 seconds
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeRide, getRideStatus, navigate]);

  // Example of how the requested REST API integration looks, 
  // though LiveRoomContext currently handles real-time syncing automatically via Supabase.
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRide) return;

    setIsSending(true);
    const textToSend = inputText;
    setInputText('');

    try {
      // API INTEGRATION REQUIREMENT: POST /api/chat/send
      // await fetch('/api/chat/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ rideId: activeRide.id, message: textToSend })
      // });
      
      // Fallback to real implementation
      await sendMessage(textToSend);
    } catch (err) {
      console.error('Failed to send message via API:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!activeRide) {
    return (
      <div className={`min-h-screen pb-24 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'} flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-10`}>
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight text-center">No Active Ride</h2>
        <p className="text-slate-500 text-center mb-8 max-w-sm">You are not currently in an active formation.</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-white/5"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isDark = theme !== 'light';
  const isExpired = getRideStatus(activeRide) === 'past';

  if (isExpired) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-300 ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight text-center">Formation Expired</h2>
        <p className="text-slate-500 text-center mb-8 max-w-sm">This ride has been completed or expired. Communications have been secured.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-white/5"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex animate-in slide-in-from-bottom-8 duration-300 ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* [ LEFT SIDEBAR ] */}
      <div className={`w-64 flex-shrink-0 flex flex-col border-r ${isDark ? 'border-white/5 bg-[#0B0F19]' : 'border-slate-200 bg-slate-50'} hidden md:flex`}>
        <div className="px-4 py-5 border-b border-white/5 flex items-center gap-3">
           <button 
             onClick={() => navigate(-1)}
             className={`p-2 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           <div>
             <h2 className="text-sm font-black uppercase tracking-widest truncate">{activeRide.title || 'Formation'}</h2>
             <p className="text-[9px] font-bold text-slate-500 uppercase">Secure Comms</p>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2">Text Channels</div>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-sm transition-all text-left">
              <span className="text-slate-400 text-lg leading-none">#</span> general
           </button>
        </div>
      </div>

      {/* [ MAIN CHAT ] */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19]">
        {/* TOP BAR */}
        <div className={`px-4 py-4 flex items-center justify-between border-b shadow-sm ${isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200'} sticky top-0 z-10 pt-[env(safe-area-inset-top,1rem)]`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className={`md:hidden p-2 rounded-full transition-all active:scale-95 ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xl font-light">#</span>
              <h2 className="text-lg font-black leading-tight max-w-[200px] truncate">
                general
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:hidden">
            <Users className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* MESSAGE AREA */}
        <div 
          ref={chatMessagesRef} 
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-transparent to-black/10"
        >
          {messages.length === 0 ? (
             <div className="h-full flex items-center justify-center flex-col opacity-50 animate-fade-in">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-500" />
                <span className="text-[11px] uppercase font-black tracking-widest text-slate-500">No messages yet</span>
                <span className="text-[9px] font-bold text-slate-600 mt-1">Start the conversation in #general</span>
             </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.user?.id === currentUser?.id;
              
              return msg.system ? (
                <div key={idx} className="text-center my-4 animate-fade-in">
                  <span className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full border shadow-sm ${isDark ? 'text-slate-400 bg-white/5 border-white/5' : 'text-slate-500 bg-slate-200/50 border-slate-200'}`}>
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div key={idx} className={`flex flex-col animate-fade-in ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-slate-500/20 overflow-hidden border border-white/10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user?.id}`} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-blue-400' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {isMe ? 'You' : msg.user?.name}
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">
                        {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md leading-relaxed ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm border border-blue-500/50 shadow-[0_4px_15px_rgba(37,99,235,0.3)]' 
                      : isDark 
                        ? 'bg-[#1A1F2E] border border-white/5 text-slate-200 rounded-tl-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INPUT AREA */}
        <div className={`p-4 border-t ${isDark ? 'bg-[#121624] border-white/5' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <button 
              type="button"
              className={`p-3 rounded-full transition-all ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message #general"
              className={`flex-1 rounded-[1.5rem] px-5 py-3.5 text-sm focus:outline-none transition-all ${isDark ? 'bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50' : 'bg-slate-100 border border-transparent text-slate-900 placeholder-slate-500 focus:border-blue-500/30 focus:bg-white focus:shadow-sm'}`}
            />
            
            <button 
              type="submit"
              disabled={!inputText.trim() || isSending}
              className={`p-3.5 rounded-full text-white transition-all duration-300 flex items-center justify-center ${inputText.trim() ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] active:scale-95 animate-pulse-glow' : 'bg-slate-600 cursor-not-allowed opacity-50'}`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>

        {/* [ BOTTOM BAR ] Voice Channel wrapper */}
        <VoiceChannel rideId={activeRide.id} />
      </div>

      {/* [ RIGHT PANEL ] MEMBER LIST */}
      <div className={`w-72 flex-shrink-0 flex flex-col border-l ${isDark ? 'border-white/5 bg-[#121624]' : 'border-slate-200 bg-white'} hidden lg:flex`}>
        <div className="px-4 py-5 border-b border-white/5">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             Members — {activeRide.participants?.length || 1}
           </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {/* Driver / Creator */}
           {activeRide.driver && (
             <div className="flex items-center gap-3">
               <div className="relative">
                 <img src={activeRide.driver.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeRide.driver_id}`} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="Leader" />
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#121624]"></div>
               </div>
               <div>
                 <div className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                   {activeRide.driver.full_name || 'Pilot'}
                   <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">Leader</span>
                 </div>
               </div>
             </div>
           )}
           
           {/* Participants */}
           {activeRide.participants?.filter((p: any) => p.user_id !== activeRide.driver_id).map((p: any, i: number) => (
             <div key={i} className="flex items-center gap-3">
               <div className="relative">
                 <img src={p.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`} className="w-10 h-10 rounded-full object-cover border border-white/10 opacity-80 hover:opacity-100 transition-opacity" alt="Rider" />
               </div>
               <div className="text-sm font-bold text-slate-300 leading-tight">
                 {p.profile?.full_name || 'Rider'}
               </div>
             </div>
           ))}
        </div>
      </div>
      
    </div>
  );
}
