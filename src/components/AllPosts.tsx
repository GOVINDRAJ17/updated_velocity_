import { ArrowLeft, Heart, MessageCircle, Share2, Bike, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  user: string;
  avatar: string;
  title: string;
  time: string;
  distance: string;
  duration: string;
  avgSpeed: string;
  likes: number;
  comments: number;
  hasLiked: boolean;
}

const allPosts: Post[] = [
  {
    id: '1',
    user: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    title: 'Morning ride to Lonavala',
    time: '2h ago',
    distance: '68.5 km',
    duration: '3h 24m',
    avgSpeed: '20.1 km/h',
    likes: 24,
    comments: 5,
    hasLiked: false,
  },
  {
    id: '2',
    user: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: 'Coastal highway cruise',
    time: '5h ago',
    distance: '125.2 km',
    duration: '5h 45m',
    avgSpeed: '21.8 km/h',
    likes: 42,
    comments: 8,
    hasLiked: true,
  },
  {
    id: '3',
    user: 'Arjun Singh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    title: 'Weekend mountain ride',
    time: '1d ago',
    distance: '92.3 km',
    duration: '4h 18m',
    avgSpeed: '21.4 km/h',
    likes: 38,
    comments: 12,
    hasLiked: true,
  },
  {
    id: '4',
    user: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    title: 'City to hill station',
    time: '1d ago',
    distance: '85.7 km',
    duration: '4h 05m',
    avgSpeed: '21.0 km/h',
    likes: 31,
    comments: 6,
    hasLiked: false,
  },
  {
    id: '5',
    user: 'Karan Mehta',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    title: 'Early morning countryside',
    time: '2d ago',
    distance: '54.8 km',
    duration: '2h 42m',
    avgSpeed: '20.3 km/h',
    likes: 28,
    comments: 4,
    hasLiked: false,
  },
  {
    id: '6',
    user: 'Amit Kumar',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
    title: 'Night ride through the city',
    time: '2d ago',
    distance: '42.3 km',
    duration: '2h 15m',
    avgSpeed: '18.8 km/h',
    likes: 22,
    comments: 3,
    hasLiked: false,
  },
  {
    id: '7',
    user: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    title: 'Exploring new routes',
    time: '3d ago',
    distance: '78.9 km',
    duration: '3h 52m',
    avgSpeed: '20.4 km/h',
    likes: 35,
    comments: 7,
    hasLiked: true,
  },
  {
    id: '8',
    user: 'Vikram Joshi',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    title: 'Highway to heaven',
    time: '3d ago',
    distance: '156.7 km',
    duration: '7h 12m',
    avgSpeed: '21.7 km/h',
    likes: 54,
    comments: 15,
    hasLiked: true,
  },
];

export function AllPosts() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen pb-6 ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'
    }`}>
      {/* Custom Header */}
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
        <h2 className="text-lg font-bold">All Rides</h2>
      </div>

      {/* Posts Grid */}
      <div className="px-4 pt-4 space-y-4">
        {allPosts.map((post) => (
          <div key={post.id} className={`rounded-3xl overflow-hidden ${
            theme === 'light' ? 'bg-white shadow-sm' : 'bg-slate-900'
          }`}>
            {/* User Info */}
            <div className="p-4 flex items-center gap-3">
              <img
                src={post.avatar}
                alt={post.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold">{post.user}</div>
                <div className={`text-xs ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>{post.time}</div>
              </div>
            </div>

            {/* Ride Info */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Bike className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold">{post.title}</h4>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className={`h-48 relative ${
              theme === 'light' ? 'bg-gradient-to-br from-slate-200 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-slate-700'
            }`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className={`w-12 h-12 ${
                  theme === 'light' ? 'text-slate-400' : 'text-slate-600'
                }`} />
              </div>
            </div>

            {/* Stats */}
            <div className={`px-4 py-3 grid grid-cols-3 gap-3 ${
              theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'
            }`}>
              <div>
                <div className={`text-xs ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Distance</div>
                <div className="font-semibold">{post.distance}</div>
              </div>
              <div>
                <div className={`text-xs ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Duration</div>
                <div className="font-semibold">{post.duration}</div>
              </div>
              <div>
                <div className={`text-xs ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Avg Speed</div>
                <div className="font-semibold">{post.avgSpeed}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-6">
              <button
                className={`flex items-center gap-2 transition-colors ${
                  post.hasLiked ? 'text-blue-500' : theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className={`flex items-center gap-2 transition-colors ${
                theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}>
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className={`ml-auto transition-colors ${
                theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}>
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
