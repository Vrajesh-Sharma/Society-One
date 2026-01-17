import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';

export default function VehicleSearch({ society }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!searchTerm.trim()) {
      setError('Please enter a number plate');
      return;
    }

    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('vehicles')
        .select(`
          *,
          users (name, phone, email, flat_number),
          flats (flat_number)
        `)
        .eq('society_id', society.society_id)
        .eq('number_plate', searchTerm.toUpperCase())
        .single();

      if (dbError) throw new Error('Vehicle not found');

      setResult(data);
    } catch (err) {
      setError(err.message || 'Vehicle not found in this society');
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
            placeholder="Enter number plate (e.g., GJ01AB1234)"
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
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-800 mb-4">Vehicle Found</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Number Plate</p>
              <p className="font-bold text-lg text-gray-800">{result.number_plate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold text-gray-800">{result.vehicle_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner Name</p>
              <p className="font-semibold text-gray-800">{result.users.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Flat Number</p>
              <p className="font-semibold text-gray-800">{result.users.flat_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-800">{result.users.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{result.users.email}</p>
            </div>
            {result.color && (
              <div>
                <p className="text-sm text-gray-600">Color</p>
                <p className="font-semibold text-gray-800">{result.color}</p>
              </div>
            )}
            {result.vehicle_brand && (
              <div>
                <p className="text-sm text-gray-600">Brand & Model</p>
                <p className="font-semibold text-gray-800">{result.vehicle_brand} {result.vehicle_model}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
