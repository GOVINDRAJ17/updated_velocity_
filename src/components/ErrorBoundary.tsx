import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl font-black mb-2 tracking-tight">System Anomaly</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Velocity encountered a critical runtime failure. We've logged the incident and are ready to recover.
            </p>

            <div className="bg-black/30 rounded-2xl p-4 mb-8 text-left border border-white/5">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Error Signature</div>
              <div className="text-xs font-mono text-red-400/80 break-all overflow-hidden line-clamp-2">
                {this.state.error?.message || 'Unknown protocol error'}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black tracking-widest text-[11px] uppercase shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> Initialize Recovery
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black tracking-widest text-[11px] uppercase text-slate-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Home className="w-4 h-4" /> Return to Base
              </button>
            </div>

            <div className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
              Telemetry Status: Active Logged
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
