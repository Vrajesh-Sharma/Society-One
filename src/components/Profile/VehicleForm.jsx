import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Car } from 'lucide-react';

export default function VehicleForm({ user, society, onVehicleAdded }) {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    number_plate: '',
    vehicle_type: '2-wheeler',
    color: '',
    vehicle_brand: '',
    vehicle_model: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('vehicles')
        .insert([
          {
            user_id: user.user_id,
            society_id: society.society_id,
            number_plate: formData.number_plate.toUpperCase(),
            vehicle_type: formData.vehicle_type,
            color: formData.color,
            vehicle_brand: formData.vehicle_brand,
            vehicle_model: formData.vehicle_model
          }
        ])
        .select();

      if (dbError) throw dbError;

      setVehicles([...vehicles, data[0]]);
      setFormData({
        number_plate: '',
        vehicle_type: '2-wheeler',
        color: '',
        vehicle_brand: '',
        vehicle_model: ''
      });
      setSuccess('Vehicle added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      onVehicleAdded?.();
    } catch (err) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (error) throw error;

      setVehicles(vehicles.filter(v => v.vehicle_id !== vehicleId));
      setSuccess('Vehicle removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Car className="w-6 h-6" />
        My Vehicles
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Vehicle List */}
      {vehicles.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="font-semibold text-gray-700">Added Vehicles:</h3>
          {vehicles.map((vehicle) => (
            <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">{vehicle.number_plate}</p>
                <p className="text-sm text-gray-600">
                  {vehicle.vehicle_type} • {vehicle.vehicle_brand} {vehicle.vehicle_model}
                  {vehicle.color && ` • ${vehicle.color}`}
                </p>
              </div>
              <button
                onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                className="text-red-600 hover:bg-red-100 p-2 rounded transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Form */}
      <form onSubmit={handleAddVehicle} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Plate *</label>
            <input
              type="text"
              name="number_plate"
              value={formData.number_plate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
              placeholder="GJ01AB1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
            <select
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="2-wheeler">2-Wheeler (Bike/Scooter)</option>
              <option value="4-wheeler">4-Wheeler (Car)</option>
              <option value="auto">Auto</option>
              <option value="commercial">Commercial Vehicle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., White, Black, Red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="vehicle_brand"
              value={formData.vehicle_brand}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Honda, Toyota, Hero"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              name="vehicle_model"
              value={formData.vehicle_model}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Civic, Activa"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}
