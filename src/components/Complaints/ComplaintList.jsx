import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Plus, Filter, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import ComplaintForm from './ComplaintForm';

export default function ComplaintList({ user, society }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, resolved, cleared
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = ['chairman', 'secretary'].includes(user.role);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('complaints')
        .select(`
          *,
          users:filed_by (name, flat_number)
        `)
        .eq('society_id', society.society_id)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'cleared') {
        updateData.cleared_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('complaint_id', complaintId);

      if (error) throw error;

      setComplaints(complaints.map(c => 
        c.complaint_id === complaintId 
          ? { ...c, ...updateData }
          : c
      ));
      setSuccess('Complaint status updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update complaint');
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('complaint_id', complaintId);

      if (error) throw error;

      setComplaints(complaints.filter(c => c.complaint_id !== complaintId));
      setSuccess('Complaint deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete complaint');
    }
  };

  const handleComplaintAdded = () => {
    fetchComplaints();
    setShowForm(false);
    setSuccess('Complaint filed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 border-red-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'cleared': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'acknowledged': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'cleared': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Complaint Box</h2>
              <p className="text-indigo-100">
                {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Complaint</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'acknowledged', label: 'Acknowledged' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'cleared', label: 'Cleared' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === tab.id
                  ? 'bg-white text-indigo-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-start gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Complaint Form */}
      {showForm && (
        <ComplaintForm
          user={user}
          society={society}
          onComplaintAdded={handleComplaintAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">No complaints found</p>
          <p className="text-gray-500 text-sm">
            {filter === 'all' 
              ? 'Be the first to file a complaint' 
              : `No ${filter} complaints at the moment`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint, index) => (
            <div
              key={complaint.complaint_id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="bg-white rounded-2xl card-shadow-lg p-6 animate-slide-up"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(complaint.status)} flex items-center gap-1.5`}>
                      {getStatusIcon(complaint.status)}
                      {complaint.status.toUpperCase()}
                    </span>
                    {complaint.users && (
                      <span className="text-sm text-gray-600">
                        by <span className="font-semibold">{complaint.users.name}</span> ({complaint.users.flat_number})
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{complaint.title}</h3>
                </div>

                {/* Delete Button (Admin or Own Complaint) */}
                {(isAdmin || complaint.filed_by === user.user_id) && (
                  <button
                    onClick={() => handleDelete(complaint.complaint_id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{complaint.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Filed on {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* Status Update Buttons (Admin Only) */}
                {isAdmin && complaint.status !== 'cleared' && (
                  <div className="flex gap-2">
                    {complaint.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate(complaint.complaint_id, 'acknowledged')}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    {complaint.status === 'acknowledged' && (
                      <button
                        onClick={() => handleStatusUpdate(complaint.complaint_id, 'resolved')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {complaint.status === 'resolved' && (
                      <button
                        onClick={() => handleStatusUpdate(complaint.complaint_id, 'cleared')}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
