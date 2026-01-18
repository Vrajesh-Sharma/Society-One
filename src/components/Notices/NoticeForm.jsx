import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send } from 'lucide-react';

export default function NoticeForm({ user, society, isAdmin, onNoticeAdded, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notice_type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    // Only admin can post urgent/maintenance notices
    if (!isAdmin && formData.notice_type !== 'general') {
      setError('Only Chairman/Secretary can post urgent or maintenance notices');
      return;
    }

    setLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('notices')
        .insert([
          {
            society_id: society.society_id,
            created_by: user.user_id,
            title: formData.title,
            description: formData.description,
            notice_type: formData.notice_type
          }
        ]);

      if (dbError) throw dbError;

      onNoticeAdded();
    } catch (err) {
      setError(err.message || 'Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl card-shadow-lg p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Post New Notice</h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notice Type <span className="text-red-500">*</span>
          </label>
          <select
            name="notice_type"
            value={formData.notice_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="general">📢 General Announcement</option>
            {isAdmin && <option value="urgent">🚨 Urgent Notice</option>}
            {isAdmin && <option value="maintenance">🔧 Maintenance Notice</option>}
          </select>
          {!isAdmin && (
            <p className="text-xs text-gray-500 mt-1">
              Only Chairman/Secretary can post urgent or maintenance notices
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notice Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Brief title for your notice"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Write your notice details here..."
          ></textarea>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Post Notice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
