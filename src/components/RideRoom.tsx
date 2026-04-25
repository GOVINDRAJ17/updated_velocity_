import { useRef, useEffect } from 'react';
import { useLiveRoom } from '../contexts/LiveRoomContext';
import { Send, Users, ShieldAlert, MessageSquare, IndianRupee } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useParticipants, useConnectionState } from '@livekit/components-react';
import { useState } from 'react';
import { SplitPayment } from './SplitPayment';

import { useNavigate } from 'react-router-dom';

export function RideRoom() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { activeRide, messages, sendMessage, liveKitToken, currentUser } = useLiveRoom();
  const [showSplits, setShowSplits] = useState(false);
  const participants = useParticipants();
  const connState = useConnectionState();
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('message') as string;
    if (text) {
      sendMessage(text);
      (e.target as HTMLFormElement).reset();
    }
  };

  if (!activeRide) {
    return (
      <div className={`min-h-screen pb-24 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'} flex flex-col items-center justify-center p-6`}>
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight text-center">No Active Link</h2>
        <p className="text-slate-500 text-center mb-8 max-w-sm">Join or start a formation to access the Live Ride Room and communicate with your squad.</p>
        <button 
          onClick={() => navigate('/groups')}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-white/5"
        >
          Find a Ride
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-64px)] pb-10 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white flex flex-col'}`}>
      
      <div className="px-5 py-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black mb-1">{activeRide.title}</h2>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
             Room Id: {activeRide.id.split('-')[0]}
          </div>
        </div>
        <button 
          onClick={() => setShowSplits(true)}
          className="bg-white/5 border border-white/10 p-3 rounded-2xl text-blue-400 hover:text-white hover:bg-blue-600 transition-all active:scale-95 shadow-lg group"
        >
          <IndianRupee className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 relative z-10 pb-20">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Tactical Chat</div>
          {connState === 'connected' && (
             <div className="text-blue-400">Voice Link Active</div>
          )}
        </div>

        <div className="flex-1 bg-black/40 border border-white/10 rounded-[2rem] p-4 flex flex-col mb-4 shadow-inner backdrop-blur-sm overflow-hidden relative">
           {!liveKitToken && (
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-900/30 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-red-400 uppercase">
                 <ShieldAlert className="w-3 h-3"/> Backend Server Offline
              </div>
           )}

          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 pb-2">
            {messages.length === 0 && (
               <div className="h-full flex items-center justify-center flex-col opacity-50">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Frequency is quiet</span>
               </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.user?.id === currentUser?.id;
              
              return msg.system ? (
                <div key={idx} className="text-center my-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] font-black ${isMe ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {isMe ? 'You' : msg.user?.name}
                      </span>
                      <span className="text-[8px] text-slate-600 font-medium">
                        {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-lg ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-tr-none border-b-2 border-emerald-700' 
                      : 'bg-[#1A1F2E] border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={onChatSubmit} className="relative mt-auto">
            <input 
              name="message"
              type="text" 
              autoComplete="off"
              placeholder="Message the squad..."
              className="w-full bg-[#121624] border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Split Payment Overlay */}
      {showSplits && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]">
          <SplitPayment 
            rideId={activeRide.id} 
            onClose={() => setShowSplits(false)} 
          />
        </div>
      )}
    </div>
  );
}
