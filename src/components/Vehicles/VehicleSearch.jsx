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
      // Step 1: Get vehicle with flat info
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          added_by_user:added_by (name),
          flat:flat_id (
            flat_id,
            flat_number
          )
        `)
        .eq('society_id', society.society_id)
        .eq('number_plate', searchTerm.toUpperCase())
        .single();

      if (vehicleError) {
        throw new Error('Vehicle not found in this society');
      }

      // Step 2: Get ALL users from the same flat_number (not just owner)
      const { data: flatResidents, error: residentsError } = await supabase
        .from('users')
        .select('name, phone, email, role, flat_number')
        .eq('society_id', society.society_id)
        .eq('flat_number', vehicleData.flat.flat_number)
        .order('name', { ascending: true });

      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
      }

      // Combine data
      const combinedResult = {
        ...vehicleData,
        flat: {
          ...vehicleData.flat,
          users: flatResidents || []
        }
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
            <p className="text-indigo-100">Find vehicle and flat owner details</p>
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
                <p className="text-green-100 text-sm">Flat & owner details below</p>
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

                {result.added_by_user && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Added By</p>
                    <p className="font-semibold text-gray-900">{result.added_by_user.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Flat & Residents Info */}
            {result.flat && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">
                  Flat {result.flat.flat_number} - All Residents ({result.flat.users?.length || 0})
                </h4>
                <div className="space-y-3">
                  {result.flat.users && result.flat.users.length > 0 ? (
                    result.flat.users.map((resident, index) => (
                      <div
                        key={index}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 animate-slide-up"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900">{resident.name}</p>
                              {resident.role !== 'resident' && (
                                <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded-full capitalize">
                                  {resident.role}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              <Home className="w-3 h-3 inline mr-1" />
                              {resident.flat_number}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pl-13">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="break-all">{resident.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="break-all truncate">{resident.email}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium">No residents found for this flat</p>
                      <p className="text-xs text-gray-500 mt-1">The flat may be vacant or data is incomplete</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
