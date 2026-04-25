import { ArrowLeft, Shield, Eye, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 font-sans overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 mb-10 pt-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest">Privacy Protocol</h1>
      </header>

      <div className="space-y-8 max-w-lg mx-auto">
        <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-lg">Trust Framework</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Velocity is built on the principle of minimal data persistence. We collect only the telemetry necessary for formation safety and navigation.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold mb-1 uppercase tracking-tight text-sm">Geospatial Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We track your coordinates in the background only when a 'Formation' is active. This is essential for your squad to see your position on the vector map. Background data is paused automatically when you reach your destination.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Eye className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold mb-1 uppercase tracking-tight text-sm">Communication Privacy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Voice logs via LiveKit are streamed in real-time and NOT recorded by Velocity servers. Chats are encrypted in transit via Supabase secure protocols.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold mb-1 uppercase tracking-tight text-sm">Right to Erasure</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per modern regulations, you can purge your entire telemetry history and profile at any time from the account settings. No data is shared with third-party advertising signatures.
              </p>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Last Sync: April 2026</p>
          <p className="text-[9px] text-slate-700 italic">"Security is the ultimate baseline of speed."</p>
        </div>
      </div>
    </div>
  );
}
