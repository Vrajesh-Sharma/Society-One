import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, AlertCircle, User, Home, Phone, Mail, Package } from 'lucide-react';

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
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('society_id', society.society_id)
        .eq('number_plate', searchTerm.toUpperCase())
        .single();

      if (vehicleError) {
        throw new Error('Vehicle not found in this society');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', vehicleData.user_id)
        .single();

      if (userError) throw userError;

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
    <div className="max-w-3xl mx-auto pb-24 md:pb-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Vehicle Search</h2>
            <p className="text-indigo-100">Find vehicle owner details instantly</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 font-mono text-lg placeholder-gray-400 focus:ring-4 focus:ring-white/30 focus:outline-none uppercase"
                placeholder="GJ27K4006"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl p-8 border-2 border-red-200 animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">Vehicle Not Found</h3>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure you entered the correct number plate
            </p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-2xl card-shadow-lg overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Vehicle Found!</h3>
                <p className="text-green-100 text-sm">Owner details below</p>
              </div>
            </div>

            {/* Number Plate Display */}
            <div className="bg-white text-gray-900 rounded-lg p-4 border-4 border-gray-800 inline-block">
              <p className="font-mono font-bold text-2xl">{result.number_plate}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            {/* Vehicle Info */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Vehicle Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                    <span className="text-xl">
                      {result.vehicle_type === '2-wheeler' ? '🏍️' : 
                       result.vehicle_type === 'auto' ? '🛺' : 
                       result.vehicle_type === 'commercial' ? '🚚' : '🚗'}
                    </span>
                    {result.vehicle_type.replace('-', ' ')}
                  </p>
                </div>

                {(result.vehicle_brand || result.vehicle_model) && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Brand & Model</p>
                    <p className="font-semibold text-gray-900">
                      {result.vehicle_brand} {result.vehicle_model}
                    </p>
                  </div>
                )}

                {result.color && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Color</p>
                    <p className="font-semibold text-gray-900">{result.color}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Owner Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owner Name</p>
                    <p className="font-bold text-gray-900">{result.user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Flat Number</p>
                    <p className="font-bold text-gray-900">{result.user.flat_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-bold text-gray-900">{result.user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-bold text-gray-900 truncate">{result.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {searched && !result && !error && !loading && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium">No results found</p>
          <p className="text-gray-500 text-sm">Try searching with a different number plate</p>
        </div>
      )}
    </div>
  );
}
