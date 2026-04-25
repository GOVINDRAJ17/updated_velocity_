import { ArrowLeft, Search, Users, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import { useNavigate } from 'react-router-dom';

const communityGroups = [
  {
    id: '1',
    name: 'Mumbai Riders Hub',
    image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=100&h=100&fit=crop',
    members: 1243,
    lastMessage: 'Planning a weekend ride...',
    unread: 3,
    time: '2m ago',
  },
  {
    id: '2',
    name: 'Royal Enfield Enthusiasts',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=100&h=100&fit=crop',
    members: 2341,
    lastMessage: 'New Classic 650 launched!',
    unread: 0,
    time: '1h ago',
  },
  {
    id: '3',
    name: 'Coastal Highway Riders',
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=100&h=100&fit=crop',
    members: 856,
    lastMessage: 'Weather looks perfect tomorrow',
    unread: 12,
    time: '3h ago',
  },
];

export function Chat() {
  const navigate = useNavigate();
  const { theme } = useTheme();

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
        <h2 className="font-bold text-lg">Community Groups</h2>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input
            type="text"
            placeholder="Search groups..."
            className={`w-full pl-10 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light' 
                ? 'bg-white shadow-sm text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 text-white placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="px-4 space-y-2">
        {communityGroups.map((group) => (
          <button
            key={group.id}
            className={`w-full rounded-2xl p-4 text-left transition-all ${
              theme === 'light'
                ? 'bg-white shadow-sm hover:shadow-md'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                {group.unread > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {group.unread}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{group.name}</h3>
                  <span className={`text-xs ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    {group.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className={`text-xs ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {group.members.toLocaleString()} members
                  </span>
                </div>
                
                <p className={`text-sm truncate ${
                  group.unread > 0 
                    ? 'font-medium text-blue-500' 
                    : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {group.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
