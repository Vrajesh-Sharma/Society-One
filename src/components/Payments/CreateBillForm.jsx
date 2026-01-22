import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function CreateBillForm({ user, society, onBillCreated }) {
  const [formData, setFormData] = useState({
    bill_month: '',
    bill_type: 'regular',
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

    // Auto-update title based on bill type
    if (name === 'bill_type') {
      const now = new Date();
      const monthYear = `${now.toLocaleString('en-IN', { month: 'long' })} ${now.getFullYear()}`;
      
      switch (value) {
        case 'regular':
          setFormData(prev => ({ ...prev, title: `${monthYear} Maintenance` }));
          break;
        case 'special':
          setFormData(prev => ({ ...prev, title: `${monthYear} Special Charge` }));
          break;
        case 'event':
          setFormData(prev => ({ ...prev, title: `${monthYear} Event Fund` }));
          break;
        case 'repair':
          setFormData(prev => ({ ...prev, title: `${monthYear} Repair Fund` }));
          break;
        default:
          break;
      }
    }
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
      const defaultAmount = parseFloat(formData.default_amount);

      // Step 1: Create maintenance bill
      const { data: billData, error: billError } = await supabase
        .from('maintenance_bills')
        .insert([
          {
            society_id: society.society_id,
            bill_month: formData.bill_month,
            bill_year: billYear,
            default_amount: defaultAmount,
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

      if (flats.length === 0) {
        throw new Error('No flats found in society. Please add flats first.');
      }

      // Step 3: Calculate adjusted amount for each flat based on previous bills
      const flatBills = [];
      let totalAdjustments = 0;
      let flatsWithAdjustments = 0;

      for (const flat of flats) {
        // Get all previous flat bills for this flat with outstanding balance
        const { data: previousBills } = await supabase
          .from('flat_bills')
          .select('balance_due, flat_bill_id')
          .eq('flat_id', flat.flat_id);

        // Calculate total outstanding balance (positive = owed, negative = overpaid)
        const totalOutstanding = previousBills?.reduce(
          (sum, bill) => sum + parseFloat(bill.balance_due), 
          0
        ) || 0;

        // Zero out previous bills' balance_due since they're now carried forward to new bill
        if (previousBills && previousBills.length > 0) {
          await supabase
            .from('flat_bills')
            .update({ balance_due: 0 })
            .eq('flat_id', flat.flat_id);
        }

        // Calculate adjusted amount
        // If totalOutstanding > 0: flat owes money, add to bill
        // If totalOutstanding < 0: flat has advance, subtract from bill
        const adjustedAmount = Math.max(0, defaultAmount + totalOutstanding);

        if (totalOutstanding !== 0) {
          totalAdjustments += Math.abs(totalOutstanding);
          flatsWithAdjustments++;
        }

        flatBills.push({
          bill_id: billData.bill_id,
          flat_id: flat.flat_id,
          flat_number: flat.flat_number,
          society_id: society.society_id,
          bill_amount: defaultAmount,           // Original bill amount
          adjusted_amount: adjustedAmount,      // After applying previous balance
          balance_due: adjustedAmount,          // Initially same as adjusted_amount
          total_paid: 0,
          status: adjustedAmount === 0 ? 'paid' : 'pending'
        });
      }

      // Step 4: Insert all flat bills
      const { error: flatBillsError } = await supabase
        .from('flat_bills')
        .insert(flatBills);

      if (flatBillsError) throw flatBillsError;

      // Success message with adjustment info
      let successMsg = `✅ Bill "${formData.title}" created for ${flats.length} flats!`;
      if (flatsWithAdjustments > 0) {
        successMsg += ` (${flatsWithAdjustments} flats had balance adjustments)`;
      }
      
      setSuccess(successMsg);
      setFormData({
        bill_month: formData.bill_month,
        bill_type: 'regular',
        default_amount: '',
        due_date: '',
        title: '',
        description: ''
      });
      onBillCreated?.();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const billTypeOptions = [
    { 
      value: 'regular', 
      label: '🏠 Regular Maintenance', 
      description: 'Monthly maintenance charges',
      icon: '🏠'
    },
    { 
      value: 'special', 
      label: '⚡ Special Charge', 
      description: 'One-time special assessments',
      icon: '⚡'
    },
    { 
      value: 'event', 
      label: '🎉 Event Fund', 
      description: 'Diwali, Navratri, festivals',
      icon: '🎉'
    },
    { 
      value: 'repair', 
      label: '🔧 Repair/Renovation', 
      description: 'Building repairs, painting, etc.',
      icon: '🔧'
    }
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Bill</h3>
      <p className="text-gray-600 mb-6">Create maintenance or special charges for all flats</p>

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
        {/* Bill Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Bill Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {billTypeOptions.map(option => (
              <label
                key={option.value}
                className={`relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                  formData.bill_type === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="bill_type"
                  value={option.value}
                  checked={formData.bill_type === option.value}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-semibold text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

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
              Amount per Flat (₹) <span className="text-red-500">*</span>
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
              Description <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Includes water charges, electricity for common areas, security salaries..."
            ></textarea>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">💡 Auto-adjustment enabled!</p>
            <p className="text-blue-600">
              Previous unpaid amounts will be added to bills automatically. Advance payments will be applied as discounts. Multiple bills per month are allowed.
            </p>
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
