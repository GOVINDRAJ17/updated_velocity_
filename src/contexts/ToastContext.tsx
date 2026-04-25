import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-2), { id, type, message, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors: Record<ToastType, string> = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/40 bg-red-500/10 text-red-400',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  };

  const dotColors: Record<ToastType, string> = {
    success: 'bg-emerald-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
    warning: 'bg-yellow-400',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t, i) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto w-full max-w-[380px]
              flex items-center gap-3 px-4 py-3.5
              bg-[#121624]/95 backdrop-blur-xl
              border rounded-2xl shadow-2xl
              ${colors[t.type]}
              animate-in slide-in-from-top-2 fade-in duration-300
            `}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => dismiss(t.id)}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${dotColors[t.type]} text-[#0B0F19]`}>
              {icons[t.type]}
            </div>
            <p className="text-[12px] font-bold text-white flex-1 leading-snug">{t.message}</p>
            <button className="text-white/30 hover:text-white/60 transition-colors text-[10px] pl-1 flex-shrink-0">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
