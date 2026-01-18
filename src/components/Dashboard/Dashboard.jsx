import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from '../Profile/Profile';
import VehicleSearch from '../Vehicles/VehicleSearch';
import ComplaintList from '../Complaints/ComplaintList';
import NoticeBoard from '../Notices/NoticeBoard';
import DesktopNavigation from '../Common/DesktopNavigation';
import MobileNavigation from '../Common/MobileNavigation';

export default function Dashboard({ user, society, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Safety check
  if (!user || !society) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Map routes to tabs
  const routeToTab = {
    '/profile': 'profile',
    '/vehicles': 'search-vehicle',
    '/notices': 'notices',
    '/complaints': 'complaints'
  };

  const tabToRoute = {
    'profile': '/profile',
    'search-vehicle': '/vehicles',
    'notices': '/notices',
    'complaints': '/complaints'
  };

  const currentTab = routeToTab[location.pathname] || 'profile';

  const handleTabChange = (tab) => {
    navigate(tabToRoute[tab]);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DesktopNavigation
        activeTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
        society={society}
        onLogout={handleLogout}
      />
      <MobileNavigation
        activeTab={currentTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <div className="md:ml-20 pt-0 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {currentTab === 'profile' && <Profile user={user} society={society} />}
          {currentTab === 'search-vehicle' && <VehicleSearch society={society} />}
          {currentTab === 'notices' && <NoticeBoard user={user} society={society} />}
          {currentTab === 'complaints' && <ComplaintList user={user} society={society} />}
        </div>
      </div>
    </div>
  );
}
