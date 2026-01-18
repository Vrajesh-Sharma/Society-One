import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function CreateBillForm({ user, society, onBillCreated }) {
  const [formData, setFormData] = useState({
    bill_month: '',
    default_amount: '',
    due_date: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-set current month
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      bill_month: `${year}-${month}`,
      title: `${now.toLocaleString('en-IN', { month: 'long' })} ${year} Maintenance`
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.bill_month || !formData.default_amount || !formData.due_date || !formData.title) {
      setError('All required fields must be filled');
      return;
    }

    setLoading(true);

    try {
      const billYear = parseInt(formData.bill_month.split('-')[0]);

      // Step 1: Create maintenance bill
      const { data: billData, error: billError } = await supabase
        .from('maintenance_bills')
        .insert([
          {
            society_id: society.society_id,
            bill_month: formData.bill_month,
            bill_year: billYear,
            default_amount: parseFloat(formData.default_amount),
            due_date: formData.due_date,
            title: formData.title,
            description: formData.description,
            created_by: user.user_id
          }
        ])
        .select()
        .single();

      if (billError) throw billError;

      // Step 2: Get all flats in society
      const { data: flats, error: flatsError } = await supabase
        .from('flats')
        .select('flat_id, flat_number')
        .eq('society_id', society.society_id);

      if (flatsError) throw flatsError;

      // Step 3: Create flat_bills for each flat
      const flatBills = flats.map(flat => ({
        bill_id: billData.bill_id,
        flat_id: flat.flat_id,
        flat_number: flat.flat_number,
        society_id: society.society_id,
        bill_amount: parseFloat(formData.default_amount),
        balance_due: parseFloat(formData.default_amount),
        total_paid: 0,
        status: 'pending'
      }));

      const { error: flatBillsError } = await supabase
        .from('flat_bills')
        .insert(flatBills);

      if (flatBillsError) throw flatBillsError;

      setSuccess(`Bill created successfully for ${flats.length} flats!`);
      setFormData({
        bill_month: formData.bill_month,
        default_amount: '',
        due_date: '',
        title: formData.title,
        description: ''
      });
      onBillCreated?.();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Maintenance Bill</h3>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              name="bill_month"
              value={formData.bill_month}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maintenance Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="default_amount"
              value={formData.default_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="3000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="January 2026 Maintenance"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Water charges, electricity, maintenance charges..."
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
              Creating Bill...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Bill for All Flats
            </>
          )}
        </button>
      </form>
    </div>
  );
}
