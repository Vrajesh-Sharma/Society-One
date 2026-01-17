import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRight } from 'lucide-react';

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

  if (loading) return <div className="text-center py-8">Loading societies...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Society Hub</h1>
        <p className="text-gray-600 mb-6">Select your society to continue</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {societies.map((society) => (
            <button
              key={society.society_id}
              onClick={() => onSelect(society)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-800">{society.name}</p>
                <p className="text-sm text-gray-500">{society.city}, {society.state}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
