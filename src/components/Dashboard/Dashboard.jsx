import { useState } from 'react';
import Profile from '../Profile/Profile';
import VehicleSearch from '../Vehicles/VehicleSearch';
import ComplaintList from '../Complaints/ComplaintList';
import NoticeBoard from '../Notices/NoticeBoard';
import DesktopNavigation from '../Common/DesktopNavigation';
import MobileNavigation from '../Common/MobileNavigation';

export default function Dashboard({ user, society, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      <div className="md:ml-20 pt-0 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {activeTab === 'profile' && <Profile user={user} society={society} />}
          {activeTab === 'search-vehicle' && <VehicleSearch society={society} />}
          {activeTab === 'notices' && <NoticeBoard user={user} society={society} />}
          {activeTab === 'complaints' && <ComplaintList user={user} society={society} />}
        </div>
      </div>
    </div>
  );
}
