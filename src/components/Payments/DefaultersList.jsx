import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Phone, Mail } from 'lucide-react';

export default function DefaultersList({ society, currentBill }) {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBill) {
      fetchDefaulters();
    }
  }, [currentBill]);

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('flat_bills')
        .select(`
          *,
          flats (
            flat_id,
            flat_number,
            users (name, phone, email)
          )
        `)
        .eq('bill_id', currentBill.bill_id)
        .neq('status', 'paid')
        .order('flat_number', { ascending: true });

      setDefaulters(data || []);
    } catch (err) {
      console.error('Error fetching defaulters:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBill) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No active bill found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading defaulters...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Pending Payments</h3>
      <p className="text-gray-600 mb-6">Flats that haven't paid for {currentBill.title}</p>

      {defaulters.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <p className="text-green-700 font-semibold text-lg">All Flats Paid!</p>
          <p className="text-green-600 text-sm mt-2">100% collection achieved</p>
        </div>
      ) : (
        <div className="space-y-4">
          {defaulters.map((defaulter, index) => (
            <div
              key={defaulter.flat_bill_id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="bg-red-50 border border-red-200 rounded-xl p-5 animate-slide-up"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Flat {defaulter.flat_number}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold capitalize text-red-600">{defaulter.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{parseFloat(defaulter.balance_due).toLocaleString('en-IN')}
                  </p>
                  {parseFloat(defaulter.total_paid) > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Paid: ₹{parseFloat(defaulter.total_paid).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {defaulter.flats?.users && defaulter.flats.users.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-red-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact Details:</p>
                  {defaulter.flats.users.map((resident, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{resident.name}</span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{resident.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{resident.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
