import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRight, Building2, MapPin } from 'lucide-react';

export default function SocietySelect({ onSelect }) {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSocieties(data || []);
    } catch (err) {
      setError('Failed to load societies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading societies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 brand-gradient bg-clip-text text-transparent" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SocietyOne</h1>
          <p className="text-indigo-100">Smart Apartment Management Platform</p>
        </div>

        {/* Society Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Society</h2>
          <p className="text-gray-600 mb-6">Choose your apartment complex to get started</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {societies.map((society, index) => (
              <button
                key={society.society_id}
                onClick={() => onSelect(society)}
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                className="w-full animate-slide-up p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{society.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {society.city}, {society.state}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-indigo-100 text-sm mt-8">
          Secure • Reliable • Trustworthy
        </p>
      </div>
    </div>
  );
}
