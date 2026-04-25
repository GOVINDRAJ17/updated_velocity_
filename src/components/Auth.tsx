import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function Auth({ onAuthComplete }: { onAuthComplete: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthComplete();
    });
  }, [onAuthComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthComplete();
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) {
          // If error is rate limit, we can throw it cleanly
          if (error.status === 429) {
             throw new Error("Supabase Email Rate Limit Exceeded (3 per hour). Please use 'Dev Bypass' to access the app.");
          }
          throw error;
        }
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, full_name: fullName }]);
          toast("Account created! Please verify your email.", "success");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with " + provider);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-2">
            Velocity
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/50">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button 
            onClick={() => handleOAuth('google')}
            className="w-full bg-slate-700/50 hover:bg-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors text-slate-200 border border-slate-600"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          
          <button 
            onClick={() => handleOAuth('apple')}
            className="w-full bg-slate-700/50 hover:bg-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors text-slate-200 border border-slate-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.31-.83 3.65-.7 1.58.11 2.87.82 3.64 2.12-3.13 1.94-2.64 6.2.33 7.42-.51 1.25-1.35 2.5-2.7 3.33zm-4.48-13.88c.24-1.63-1.05-3.25-2.58-3.4-1.57.17-2.91 1.76-2.58 3.4z"/></svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="text-slate-500 text-sm font-medium">Or continue with email</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-600 mt-2">Secure biometric link established</p>
        </div>
      </div>
    </div>
  );
}
