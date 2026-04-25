import { X, Share2, Instagram, Facebook, Twitter, Download, MapPin } from 'lucide-react';

interface RideSummaryProps {
  data: {
    distance: string;
    duration: string;
    avgSpeed: string;
    maxSpeed: string;
    elevation: string;
    calories: string;
    rideName: string;
  };
  onClose: () => void;
}

export function RideSummary({ data, onClose }: RideSummaryProps) {
  const handleShare = (platform: string) => {
    alert(`Sharing to ${platform}...`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-center">
            <h2 className="text-2xl font-bold mb-1">Ride Complete! 🏆</h2>
            <p className="text-blue-100">{data.rideName}</p>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-700 border-y border-slate-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-slate-600" />
            </div>
            {/* Route overlay effect */}
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <path
                d="M 20 150 Q 80 100, 150 120 T 280 100 T 400 140"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{data.distance}</div>
                <div className="text-sm text-slate-400">Distance (km)</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{data.duration}</div>
                <div className="text-sm text-slate-400">Duration</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{data.avgSpeed}</div>
                <div className="text-xs text-slate-400">Avg Speed (km/h)</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{data.maxSpeed}</div>
                <div className="text-xs text-slate-400">Max Speed (km/h)</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{data.elevation}</div>
                <div className="text-xs text-slate-400">Elevation (m)</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{data.calories}</div>
                <div className="text-xs text-slate-400">Calories</div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center mb-3">Share Your Achievement</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare('Instagram')}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </button>
                <button
                  onClick={() => handleShare('Facebook')}
                  className="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('Twitter')}
                  className="bg-sky-600 hover:bg-sky-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('Download')}
                  className="bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-colors border border-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
