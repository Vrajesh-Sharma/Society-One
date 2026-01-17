import { useState } from 'react';
import { Users, Car, Megaphone, MessageSquare, BarChart3 } from 'lucide-react';
import VehicleForm from '../Profile/VehicleForm';
import VehicleSearch from '../Vehicles/VehicleSearch';

export default function Dashboard({ user, society }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'search-vehicle', label: 'Search Vehicle', icon: Car },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'profile' && (
          <VehicleForm user={user} society={society} />
        )}

        {activeTab === 'search-vehicle' && (
          <VehicleSearch society={society} />
        )}

        {activeTab === 'notices' && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Notice Board coming soon...</p>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Complaint Box coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
