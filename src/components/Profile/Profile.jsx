import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, Home, Save, AlertCircle, CheckCircle, Pencil, Shield } from 'lucide-react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (editMode) {
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

    if (!formData.name || !formData.email || !formData.phone || !formData.flat_number) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
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

      if (formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (authError) throw authError;
      }

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

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <Home className="w-4 h-4" />
                {user.flat_number} • {society.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition shadow-lg ${
              editMode
                ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                : 'bg-white text-indigo-600 hover:shadow-xl'
            }`}
          >
            <Pencil className="w-4 h-4" />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl card-shadow-lg p-6 md:p-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {editMode ? (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl input-focus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl input-focus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl input-focus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Flat Number</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="flat_number"
                    value={formData.flat_number}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl input-focus"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <p className="text-xs font-bold text-indigo-600 uppercase">Full Name</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{user.name}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <p className="text-xs font-bold text-blue-600 uppercase">Email</p>
                </div>
                <p className="text-lg font-bold text-gray-900 break-all">{user.email}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-bold text-green-600 uppercase">Phone</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{user.phone}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="w-5 h-5 text-purple-600" />
                  <p className="text-xs font-bold text-purple-600 uppercase">Flat Number</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{user.flat_number}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicles Section */}
      {!editMode && <VehicleForm user={user} society={society} />}
    </div>
  );
}
