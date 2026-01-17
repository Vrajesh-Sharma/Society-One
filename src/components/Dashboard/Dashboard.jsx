import { useState } from 'react';
import { Users, Car, Megaphone, MessageSquare, Sparkles } from 'lucide-react';
import Profile from '../Profile/Profile';
import VehicleSearch from '../Vehicles/VehicleSearch';
import DesktopNavigation from '../Common/DesktopNavigation';
import MobileNavigation from '../Common/MobileNavigation';

export default function Dashboard({ user, society, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <DesktopNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        society={society}
        onLogout={onLogout}
      />
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="md:ml-20 pt-0 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {activeTab === 'profile' && <Profile user={user} society={society} />}

          {activeTab === 'search-vehicle' && <VehicleSearch society={society} />}

          {activeTab === 'notices' && (
            <div className="bg-white rounded-2xl card-shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Megaphone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Notice Board</h3>
                <p className="text-gray-600 mb-2">Coming Soon!</p>
                <p className="text-sm text-gray-500">
                  Stay updated with society announcements and important notices
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">In Development</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl card-shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Complaint Box</h3>
                <p className="text-gray-600 mb-2">Coming Soon!</p>
                <p className="text-sm text-gray-500">
                  Report issues and track resolution status easily
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">In Development</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
