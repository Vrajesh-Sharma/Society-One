import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Receipt, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResidentPayments({ user, society }) {
  const [currentBill, setCurrentBill] = useState(null);
  const [flatBill, setFlatBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userFlat, setUserFlat] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get user's flat
      const { data: flat } = await supabase
        .from('flats')
        .select('flat_id, flat_number')
        .eq('society_id', society.society_id)
        .eq('flat_number', user.flat_number)
        .single();

      if (!flat) return;
      setUserFlat(flat);

      // Get latest bill
      const { data: latestBill } = await supabase
        .from('maintenance_bills')
        .select('*')
        .eq('society_id', society.society_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setCurrentBill(latestBill);

      if (latestBill) {
        // Get flat bill for current month
        const { data: flatBillData } = await supabase
          .from('flat_bills')
          .select('*')
          .eq('flat_id', flat.flat_id)
          .eq('bill_id', latestBill.bill_id)
          .single();

        setFlatBill(flatBillData);
      }

      // Get payment history
      const { data: paymentData } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          flat_bills (
            bill_amount,
            maintenance_bills (title, bill_month)
          )
        `)
        .eq('flat_id', flat.flat_id)
        .order('payment_date', { ascending: false })
        .limit(10);

      setPayments(paymentData || []);

      // Get balance
      const { data: balanceData } = await supabase
        .from('flat_ledger')
        .select('*')
        .eq('flat_id', flat.flat_id)
        .single();

      setBalance(balanceData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">My Payments</h2>
            <p className="text-green-100">Flat {user.flat_number}</p>
          </div>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-green-100 text-sm mb-1">Current Balance</p>
            <p className={`text-3xl font-bold ${
              parseFloat(balance.balance) > 0 ? 'text-green-200' :
              parseFloat(balance.balance) < 0 ? 'text-red-200' : 'text-white'
            }`}>
              {parseFloat(balance.balance) >= 0 ? '+' : ''}₹{Math.abs(parseFloat(balance.balance)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-green-100 mt-1">
              {parseFloat(balance.balance) > 0 ? 'Advance Payment' :
               parseFloat(balance.balance) < 0 ? 'Amount Due' : 'All Clear'}
            </p>
          </div>
        )}
      </div>

      {/* Current Bill */}
      {currentBill && flatBill ? (
        <div className="bg-white rounded-2xl card-shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Current Bill</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{currentBill.title}</h4>
                <p className="text-sm text-gray-600">
                  Due Date: {new Date(currentBill.due_date).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  flatBill.status === 'paid' ? 'bg-green-100 text-green-700' :
                  flatBill.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {flatBill.status === 'paid' ? '✓ Paid' :
                   flatBill.status === 'partial' ? '⏳ Partial' : '⏳ Pending'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Bill Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{parseFloat(flatBill.bill_amount).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Paid</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{parseFloat(flatBill.total_paid).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Balance Due</p>
                <p className="text-lg font-bold text-red-600">
                  ₹{parseFloat(flatBill.balance_due).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {flatBill.status !== 'paid' && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-700">
                  💡 <strong>Note:</strong> Please contact the Society Secretary to record your payment
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow-lg p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No active bills at the moment</p>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl card-shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment History</h3>

        {payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600">No payment records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={payment.transaction_id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition animate-slide-up"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {payment.flat_bills?.maintenance_bills?.title || 'Payment'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.payment_date).toLocaleDateString('en-IN')} • {payment.payment_method.toUpperCase()}
                  </p>
                  {payment.transaction_reference && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ref: {payment.transaction_reference}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +₹{parseFloat(payment.amount_paid).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
