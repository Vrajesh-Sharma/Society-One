import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, Home, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import VehicleForm from './VehicleForm';

export default function Profile({ user: initialUser, society }) {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phone: initialUser.phone,
    flat_number: initialUser.flat_number
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVehicles, setShowVehicles] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Reset form if canceling
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        flat_number: user.flat_number
      });
    }
    setError('');
    setSuccess('');
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.flat_number) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // Update user in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          flat_number: formData.flat_number
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      // If email changed, update in Auth as well
      if (formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (authError) throw authError;
      }

      // Update local state
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = () => {
    // Refresh user data if needed
    setSuccess('Vehicle added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6" />
            My Profile
          </h2>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              editMode
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {editMode ? (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Flat Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flat/House Number</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="flat_number"
                  value={formData.flat_number}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          /* Display Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-800 break-all">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
              <p className="text-lg font-semibold text-gray-800">{user.phone}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Flat/House</p>
              <p className="text-lg font-semibold text-gray-800">{user.flat_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Role</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{user.role}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Society</p>
              <p className="text-lg font-semibold text-gray-800">{society.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Vehicles Section */}
      {!editMode && (
        <div>
          <VehicleForm user={user} society={society} onVehicleAdded={handleVehicleAdded} />
        </div>
      )}
    </div>
  );
}
