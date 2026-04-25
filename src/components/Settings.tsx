import { useState } from 'react';
import { ArrowLeft, Sun, Moon, Mic, Check, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useWalkieTalkie } from '../contexts/WalkieTalkieContext';

import { useNavigate } from 'react-router-dom';

export function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode, timerDuration, setTimerDuration } = useWalkieTalkie();
  const [showTimerPicker, setShowTimerPicker] = useState(false);

  const handleTimerChange = (value: number) => {
    setTimerDuration(value);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'
    }`}>
      {/* Header */}
      <div className={`sticky top-14 px-4 py-3 flex items-center gap-3 z-40 ${
        theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'
      }`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full transition-colors ${
            theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">Settings</h2>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-6">
        {/* Appearance */}
        <div>
          <h3 className={`font-semibold mb-3 ${
            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}>Appearance</h3>
          
          <div className={`rounded-2xl p-4 ${
            theme === 'light' ? 'bg-white shadow-sm' : 'bg-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <Sun className="w-5 h-5 text-yellow-600" />
                  </div>
                ) : (
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <Moon className="w-5 h-5 text-blue-500" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">Theme</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  theme === 'light' ? 'bg-slate-300' : 'bg-blue-600'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  theme === 'light' ? 'left-0.5' : 'left-7'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Walkie-Talkie Settings */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <Mic className="w-4 h-4 text-blue-500" />
            Walkie-Talkie Controls
          </h3>
          
          <div className="space-y-3">
            {/* Hold to Talk */}
            <button
              onClick={() => setMode('hold')}
              className={`w-full rounded-2xl p-4 transition-all ${
                mode === 'hold'
                  ? theme === 'light'
                    ? 'bg-blue-100 shadow-sm'
                    : 'bg-blue-900/30'
                  : theme === 'light'
                    ? 'bg-white shadow-sm'
                    : 'bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="font-semibold mb-1">Hold to Talk</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Press and hold to transmit
                  </div>
                </div>
                {mode === 'hold' && (
                  <div className="bg-blue-600 p-1 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* Push to Talk - Manual */}
            <button
              onClick={() => setMode('push-manual')}
              className={`w-full rounded-2xl p-4 transition-all ${
                mode === 'push-manual'
                  ? theme === 'light'
                    ? 'bg-blue-100 shadow-sm'
                    : 'bg-blue-900/30'
                  : theme === 'light'
                    ? 'bg-white shadow-sm'
                    : 'bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="font-semibold mb-1">Push to Talk - Manual</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Toggle on/off with single press
                  </div>
                </div>
                {mode === 'push-manual' && (
                  <div className="bg-blue-600 p-1 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* Push to Talk - Timer */}
            <div
              className={`rounded-2xl p-4 transition-all ${
                mode === 'push-timer'
                  ? theme === 'light'
                    ? 'bg-blue-100 shadow-sm'
                    : 'bg-blue-900/30'
                  : theme === 'light'
                    ? 'bg-white shadow-sm'
                    : 'bg-slate-900'
              }`}
            >
              <button
                onClick={() => {
                  setMode('push-timer');
                  setShowTimerPicker(!showTimerPicker);
                }}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <div className="font-semibold mb-1">Push to Talk - Timer</div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Auto-off after {timerDuration} seconds
                    </div>
                  </div>
                  {mode === 'push-timer' && (
                    <div className="bg-blue-600 p-1 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>

              {/* Timer Picker */}
              {mode === 'push-timer' && showTimerPicker && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      Duration
                    </span>
                    <span className="text-lg font-bold text-blue-500">
                      {timerDuration}s
                    </span>
                  </div>
                  
                  {/* Slider */}
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={timerDuration}
                    onChange={(e) => handleTimerChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  
                  <div className={`flex justify-between text-xs mt-2 ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    <span>5s</span>
                    <span>30s</span>
                    <span>60s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div>
          <h3 className={`font-semibold mb-3 ${
            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}>Other Settings</h3>
          
          <div className="space-y-3">
            <button className={`w-full rounded-2xl p-4 text-left ${
              theme === 'light' ? 'bg-white shadow-sm' : 'bg-slate-900'
            }`}>
              <div className="font-semibold mb-1">Notifications</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Manage your notification preferences
              </div>
            </button>

            <button 
              onClick={() => navigate('/privacy')}
              className={`w-full rounded-2xl p-4 text-left transition-colors ${
                theme === 'light' ? 'bg-white shadow-sm hover:bg-slate-50' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold mb-1">Privacy Protocol</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Review telemetry and data standards
              </div>
            </button>

            <button className={`w-full rounded-2xl p-4 text-left ${
              theme === 'light' ? 'bg-white shadow-sm' : 'bg-slate-900'
            }`}>
              <div className="font-semibold mb-1">About</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Version 1.0.0
              </div>
            </button>

            <button 
              onClick={async () => await supabase.auth.signOut()}
              className="w-full rounded-2xl p-4 text-left flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors mt-6 border border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <div className="font-semibold">Log Out</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
