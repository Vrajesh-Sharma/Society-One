import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, AlertCircle } from 'lucide-react';

export default function VehicleSearch({ society }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSearched(true);

    if (!searchTerm.trim()) {
      setError('Please enter a number plate');
      return;
    }

    setLoading(true);

    try {
      // Query vehicles table directly first
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('society_id', society.society_id)
        .eq('number_plate', searchTerm.toUpperCase())
        .single();

      if (vehicleError) {
        throw new Error('Vehicle not found in this society');
      }

      // Then query user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', vehicleData.user_id)
        .single();

      if (userError) throw userError;

      // Combine results
      const combinedResult = {
        ...vehicleData,
        user: userData
      };

      setResult(combinedResult);
    } catch (err) {
      setError(err.message || 'Vehicle not found');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6" />
        Vehicle Search
      </h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
            placeholder="Enter number plate (e.g., GJ27K4006)"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Not Found</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
            ✓ Vehicle Found
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Number Plate</p>
              <p className="font-bold text-lg text-gray-800">{result.number_plate}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Vehicle Type</p>
              <p className="font-semibold text-gray-800 capitalize">{result.vehicle_type}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Owner Name</p>
              <p className="font-semibold text-gray-800">{result.user.name}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Flat Number</p>
              <p className="font-semibold text-gray-800">{result.user.flat_number}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
              <p className="font-semibold text-gray-800">{result.user.phone}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
              <p className="font-semibold text-gray-800 break-all text-sm">{result.user.email}</p>
            </div>
            {result.color && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs font-semibold text-gray-500 uppercase">Color</p>
                <p className="font-semibold text-gray-800">{result.color}</p>
              </div>
            )}
            {result.vehicle_brand && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs font-semibold text-gray-500 uppercase">Brand & Model</p>
                <p className="font-semibold text-gray-800">{result.vehicle_brand} {result.vehicle_model}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {searched && !result && !error && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No results found. Try another number plate.</p>
        </div>
      )}
    </div>
  );
}
