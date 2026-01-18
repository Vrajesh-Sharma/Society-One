import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Megaphone, Plus, AlertCircle, CheckCircle, Trash2, Bell } from 'lucide-react';
import NoticeForm from './NoticeForm';

export default function NoticeBoard({ user, society }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = ['chairman', 'secretary'].includes(user.role);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('notices')
        .select(`
          *,
          users:created_by (name, flat_number, role)
        `)
        .eq('society_id', society.society_id)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setNotices(data || []);
    } catch (err) {
      setError('Failed to load notices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noticeId, createdBy) => {
    // Only admin or notice creator can delete
    if (!isAdmin && createdBy !== user.user_id) {
      setError('You can only delete your own notices');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('notice_id', noticeId);

      if (error) throw error;

      setNotices(notices.filter(n => n.notice_id !== noticeId));
      setSuccess('Notice deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete notice');
    }
  };

  const handleNoticeAdded = () => {
    fetchNotices();
    setShowForm(false);
    setSuccess('Notice posted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getNoticeColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-gradient-to-r from-red-500 to-pink-600';
      case 'maintenance': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'general': return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'maintenance': return '🔧';
      case 'general': return '📢';
      default: return '📌';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Notice Board</h2>
              <p className="text-orange-100">
                {notices.length} {notices.length === 1 ? 'notice' : 'notices'} posted
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Post Notice</span>
          </button>
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

      {/* Notice Form */}
      {showForm && (
        <NoticeForm
          user={user}
          society={society}
          isAdmin={isAdmin}
          onNoticeAdded={handleNoticeAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Notices List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Megaphone className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">No notices yet</p>
          <p className="text-gray-500 text-sm">
            Be the first to post an announcement
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div
              key={notice.notice_id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="bg-white rounded-2xl card-shadow-lg overflow-hidden animate-slide-up"
            >
              {/* Notice Header */}
              <div className={`${getNoticeColor(notice.notice_type)} p-5 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{getNoticeIcon(notice.notice_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold uppercase">
                          {notice.notice_type}
                        </span>
                        {notice.notice_type === 'urgent' && (
                          <Bell className="w-4 h-4 animate-pulse" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{notice.title}</h3>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {(isAdmin || notice.created_by === user.user_id) && (
                    <button
                      onClick={() => handleDelete(notice.notice_id, notice.created_by)}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notice Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{notice.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {notice.users && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {notice.users.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {notice.users.name}
                          {notice.users.role !== 'resident' && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold capitalize">
                              {notice.users.role}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notice.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
