import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Car, AlertCircle, CheckCircle, Package } from 'lucide-react';

export default function VehicleForm({ user, society, onVehicleAdded }) {
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    number_plate: '',
    vehicle_type: '2-wheeler',
    color: '',
    vehicle_brand: '',
    vehicle_model: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userFlat, setUserFlat] = useState(null);

  useEffect(() => {
    fetchUserFlat();
  }, []);

  useEffect(() => {
    if (userFlat) {
      fetchVehicles();
    }
  }, [userFlat]);

  const fetchUserFlat = async () => {
    try {
      // Get the flat record for this user's flat_number
      const { data: flatData, error: flatError } = await supabase
        .from('flats')
        .select('flat_id, flat_number')
        .eq('society_id', society.society_id)
        .eq('flat_number', user.flat_number)
        .single();

      if (flatError) {
        // If flat doesn't exist, create it
        const { data: newFlat, error: createError } = await supabase
          .from('flats')
          .insert([
            {
              society_id: society.society_id,
              flat_number: user.flat_number,
              owner_id: user.user_id
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setUserFlat(newFlat);
      } else {
        setUserFlat(flatData);
      }
    } catch (err) {
      console.error('Error fetching flat:', err);
      setError('Failed to load flat information');
    }
  };

  const fetchVehicles = async () => {
    try {
      setFetchLoading(true);
      const { data, error: dbError } = await supabase
        .from('vehicles')
        .select(`
          *,
          users:added_by (name)
        `)
        .eq('flat_id', userFlat.flat_id)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.number_plate || !formData.vehicle_type) {
      setError('Number plate and vehicle type are required');
      return;
    }

    if (!userFlat) {
      setError('Flat information not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('vehicles')
        .insert([
          {
            flat_id: userFlat.flat_id,
            added_by: user.user_id,
            society_id: society.society_id,
            number_plate: formData.number_plate.toUpperCase(),
            vehicle_type: formData.vehicle_type,
            color: formData.color,
            vehicle_brand: formData.vehicle_brand,
            vehicle_model: formData.vehicle_model
          }
        ])
        .select(`
          *,
          users:added_by (name)
        `);

      if (dbError) throw dbError;

      setVehicles([data[0], ...vehicles]);
      setFormData({
        number_plate: '',
        vehicle_type: '2-wheeler',
        color: '',
        vehicle_brand: '',
        vehicle_model: ''
      });
      setSuccess('Vehicle added successfully! All family members can now see this vehicle.');
      setShowAddForm(false);
      onVehicleAdded?.();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Remove this vehicle? All family members will lose access.')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (error) throw error;

      setVehicles(vehicles.filter(v => v.vehicle_id !== vehicleId));
      setSuccess('Vehicle removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle');
    }
  };

  const getVehicleIcon = (type) => {
    return '🚗';
  };

  if (!userFlat && !fetchLoading) {
    return (
      <div className="bg-white rounded-2xl card-shadow-lg p-6 md:p-8">
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 font-medium">Unable to load flat information</p>
          <p className="text-sm text-gray-500 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl card-shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            Flat Vehicles
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {userFlat?.flat_number} • {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            👨‍👩‍👧‍👦 Shared with all family members in this flat
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Vehicle</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Add Vehicle Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 animate-slide-up">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Add New Vehicle to {userFlat?.flat_number}</h3>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="number_plate"
                  value={formData.number_plate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase font-mono text-lg"
                  placeholder="GJ27K4006"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="2-wheeler">🏍️ 2-Wheeler (Bike/Scooter)</option>
                  <option value="4-wheeler">🚗 4-Wheeler (Car)</option>
                  <option value="auto">🛺 Auto</option>
                  <option value="commercial">🚚 Commercial Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="White, Black, Red..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="vehicle_brand"
                  value={formData.vehicle_brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Honda, Toyota, Hero..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  name="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Civic, Activa, City..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle List */}
      {fetchLoading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vehicles...</p>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle.vehicle_id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="group relative bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all animate-slide-up"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                className="absolute top-3 right-3 w-8 h-8 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 transition flex items-center justify-center"
                title="Remove vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Vehicle Icon */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                  {vehicle.vehicle_type === '2-wheeler' ? '🏍️' : 
                   vehicle.vehicle_type === 'auto' ? '🛺' : 
                   vehicle.vehicle_type === 'commercial' ? '🚚' : '🚗'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Number Plate */}
                  <div className="bg-white border-2 border-gray-800 rounded-lg px-3 py-1 inline-block mb-2">
                    <p className="font-mono font-bold text-gray-900 text-lg">
                      {vehicle.number_plate}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {vehicle.vehicle_type.replace('-', ' ')}
                    </p>
                    {(vehicle.vehicle_brand || vehicle.vehicle_model) && (
                      <p className="text-sm text-gray-600">
                        {vehicle.vehicle_brand} {vehicle.vehicle_model}
                      </p>
                    )}
                    {vehicle.color && (
                      <p className="text-xs text-gray-500">
                        🎨 {vehicle.color}
                      </p>
                    )}
                    {vehicle.users && (
                      <p className="text-xs text-indigo-600 mt-2">
                        Added by {vehicle.users.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">No vehicles registered yet</p>
          <p className="text-gray-500 text-sm">Click "Add Vehicle" to register your first vehicle</p>
        </div>
      )}
    </div>
  );
}
