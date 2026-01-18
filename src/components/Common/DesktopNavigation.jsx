import { Home, Users, Car, Megaphone, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DesktopNavigation({ activeTab, onTabChange, user, society, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: Users },
    { id: 'search-vehicle', label: 'Search Vehicle', icon: Car },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('society');
      onLogout();
    }
  };

  // Safety check - don't render if user or society is null
  if (!user || !society) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-black">
                SocietyOne
              </h1>
              <p className="text-xs text-gray-500">Management Platform</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200 bg-indigo-50">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-600">{user.flat_number} • {society.name}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 card-shadow">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold brand-gradient bg-clip-text text-transparent">
              SocietyHub
            </h1>
            <p className="text-xs text-gray-600">{society.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-600">{user.flat_number}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
