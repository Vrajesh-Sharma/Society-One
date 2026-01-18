import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Receipt, Filter } from 'lucide-react';

export default function PaymentsList({ society }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          flat_bills (
            bill_amount,
            maintenance_bills (title)
          )
        `)
        .eq('society_id', society.society_id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading payments...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">All Payment Transactions</h3>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No payments recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Flat</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Bill</th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Method</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr
                  key={payment.transaction_id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="border-b border-gray-100 hover:bg-gray-50 animate-slide-up"
                >
                  <td className="p-3 text-sm text-gray-700">
                    {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3 text-sm font-semibold text-gray-900">
                    {payment.flat_number}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {payment.flat_bills?.maintenance_bills?.title || 'N/A'}
                  </td>
                  <td className="p-3 text-sm font-bold text-green-600 text-right">
                    ₹{parseFloat(payment.amount_paid).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {payment.transaction_reference || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
