import { Users, Car, Megaphone, MessageSquare, DollarSign, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MobileNavigation({ activeTab, onTabChange, onLogout }) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'search-vehicle', label: 'Search', icon: Car },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('society');
      onLogout();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
