import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Plus, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';
import CreateBillForm from './CreateBillForm';
import RecordPaymentForm from './RecordPaymentForm';
import PaymentsList from './PaymentsList';
import DefaultersList from './DefaultersList';

export default function AdminPayments({ user, society }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalFlats: 0,
    paidFlats: 0,
    pendingFlats: 0,
    totalCollected: 0,
    totalPending: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get latest bill (most recent)
      const { data: latestBill } = await supabase
        .from('maintenance_bills')
        .select('*')
        .eq('society_id', society.society_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setCurrentBill(latestBill);

      if (latestBill) {
        // Get flat bills for this bill
        const { data: flatBills } = await supabase
          .from('flat_bills')
          .select('*')
          .eq('bill_id', latestBill.bill_id);

        const paidCount = flatBills.filter(fb => fb.status === 'paid').length;
        const totalCollected = flatBills.reduce((sum, fb) => sum + parseFloat(fb.total_paid), 0);
        const totalPending = flatBills.reduce((sum, fb) => sum + parseFloat(fb.balance_due), 0);

        setStats({
          totalFlats: flatBills.length,
          paidFlats: paidCount,
          pendingFlats: flatBills.length - paidCount,
          totalCollected,
          totalPending
        });
      }

      // Also fetch all bills for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01"
      const { data: allCurrentBills } = await supabase
        .from('maintenance_bills')
        .select('*')
        .eq('society_id', society.society_id)
        .eq('bill_month', currentMonth)
        .order('created_at', { ascending: false });

      // You can use allCurrentBills to show multiple bills if needed
      console.log('All bills for current month:', allCurrentBills);

    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'create-bill', label: 'Create Bill', icon: Plus },
    { id: 'record-payment', label: 'Record Payment', icon: DollarSign },
    { id: 'payments', label: 'All Payments', icon: CheckCircle },
    { id: 'defaulters', label: 'Defaulters', icon: AlertCircle }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Maintenance Management</h2>
            <p className="text-green-100">Track bills, payments & collections</p>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : currentBill ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-green-100 text-sm mb-1">Current Month</p>
              <p className="text-2xl font-bold">{currentBill.title}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-green-100 text-sm mb-1">Collection Rate</p>
              <p className="text-2xl font-bold">
                {stats.totalFlats > 0 ? Math.round((stats.paidFlats / stats.totalFlats) * 100) : 0}%
              </p>
              <p className="text-xs text-green-100 mt-1">
                {stats.paidFlats}/{stats.totalFlats} flats paid
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-green-100 text-sm mb-1">Total Collected</p>
              <p className="text-2xl font-bold">₹{stats.totalCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-green-100 text-sm mb-1">Total Pending</p>
              <p className="text-2xl font-bold">₹{stats.totalPending.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg mb-2">No bills created yet</p>
            <p className="text-green-100 text-sm">Create your first maintenance bill to get started</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Overview stats displayed above</p>
              <p className="text-sm text-gray-500 mt-2">Use tabs to manage bills and payments</p>
            </div>
          )}

          {activeTab === 'create-bill' && (
            <CreateBillForm
              user={user}
              society={society}
              onBillCreated={fetchStats}
            />
          )}

          {activeTab === 'record-payment' && (
            <RecordPaymentForm
              user={user}
              society={society}
              onPaymentRecorded={fetchStats}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsList society={society} />
          )}

          {activeTab === 'defaulters' && (
            <DefaultersList society={society} currentBill={currentBill} />
          )}
        </div>
      </div>
    </div>
  );
}
