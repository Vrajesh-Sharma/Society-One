import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function RecordPaymentForm({ user, society, onPaymentRecorded }) {
  const [formData, setFormData] = useState({
    flat_number: '',
    bill_id: '',
    amount_paid: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_reference: '',
    remarks: ''
  });
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedFlatBill, setSelectedFlatBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBills();
    fetchFlats();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await supabase
        .from('maintenance_bills')
        .select('*')
        .eq('society_id', society.society_id)
        .order('created_at', { ascending: false });
      setBills(data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const fetchFlats = async () => {
    try {
      const { data } = await supabase
        .from('flats')
        .select('flat_id, flat_number')
        .eq('society_id', society.society_id)
        .order('flat_number', { ascending: true });
      setFlats(data || []);
    } catch (err) {
      console.error('Error fetching flats:', err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Fetch flat bill when both flat and bill are selected
    if ((name === 'flat_number' && formData.bill_id) || (name === 'bill_id' && formData.flat_number)) {
      const flatNum = name === 'flat_number' ? value : formData.flat_number;
      const billId = name === 'bill_id' ? value : formData.bill_id;

      if (flatNum && billId) {
        const flat = flats.find(f => f.flat_number === flatNum);
        if (flat) {
          const { data: flatBill } = await supabase
            .from('flat_bills')
            .select('*')
            .eq('flat_id', flat.flat_id)
            .eq('bill_id', billId)
            .single();
          setSelectedFlatBill(flatBill);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.flat_number || !formData.bill_id || !formData.amount_paid) {
      setError('Flat, bill, and amount are required');
      return;
    }

    if (!selectedFlatBill) {
      setError('Unable to find bill for selected flat');
      return;
    }

    setLoading(true);

    try {
      const flat = flats.find(f => f.flat_number === formData.flat_number);

      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert([
          {
            flat_bill_id: selectedFlatBill.flat_bill_id,
            flat_id: flat.flat_id,
            flat_number: formData.flat_number,
            society_id: society.society_id,
            amount_paid: parseFloat(formData.amount_paid),
            payment_method: formData.payment_method,
            payment_date: formData.payment_date,
            transaction_reference: formData.transaction_reference,
            remarks: formData.remarks,
            recorded_by: user.user_id
          }
        ]);

      if (paymentError) throw paymentError;

      setSuccess(`Payment of ₹${formData.amount_paid} recorded successfully for ${formData.flat_number}!`);
      setFormData({
        flat_number: '',
        bill_id: '',
        amount_paid: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
        remarks: ''
      });
      setSelectedFlatBill(null);
      onPaymentRecorded?.();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Record Payment</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {selectedFlatBill && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Bill Details:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Bill Amount:</span>
              <span className="font-bold ml-2">₹{parseFloat(selectedFlatBill.bill_amount).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-600">Already Paid:</span>
              <span className="font-bold ml-2 text-green-600">₹{parseFloat(selectedFlatBill.total_paid).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-600">Balance Due:</span>
              <span className="font-bold ml-2 text-red-600">₹{parseFloat(selectedFlatBill.balance_due).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`font-bold ml-2 capitalize ${
                selectedFlatBill.status === 'paid' ? 'text-green-600' :
                selectedFlatBill.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
              }`}>{selectedFlatBill.status}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Bill <span className="text-red-500">*</span>
            </label>
            <select
              name="bill_id"
              value={formData.bill_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Select Bill --</option>
              {bills.map(bill => (
                <option key={bill.bill_id} value={bill.bill_id}>
                  {bill.title} - ₹{parseFloat(bill.default_amount).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Flat <span className="text-red-500">*</span>
            </label>
            <select
              name="flat_number"
              value={formData.flat_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Select Flat --</option>
              {flats.map(flat => (
                <option key={flat.flat_id} value={flat.flat_number}>
                  {flat.flat_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount Paid (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="3000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="cash">💵 Cash</option>
              <option value="upi">📱 UPI</option>
              <option value="cheque">🏦 Cheque</option>
              <option value="bank_transfer">🏧 Bank Transfer</option>
              <option value="neft">💳 NEFT/RTGS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Reference (Optional)
            </label>
            <input
              type="text"
              name="transaction_reference"
              value={formData.transaction_reference}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="UPI ID / Cheque No / NEFT Ref"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Recording Payment...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Record Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
