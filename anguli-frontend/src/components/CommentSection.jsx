import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.comments);
    } catch (err) {
      toast.error('Comments load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleAddComment = async () => {
    if (!user) return navigate('/login');
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      toast.error('Comment post nahi hua');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      toast.error('Comment delete nahi hua');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Comments ({comments.length})</h3>

      <div className="flex gap-2 mb-4">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          placeholder="Comment likhein..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-primary-500"
        />
        <button
          onClick={handleAddComment}
          disabled={submitting}
          className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          Post
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">Koi comment nahi hai abhi. Sabse pehle comment karein!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <img
                src={c.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}&background=2563eb&color=fff`}
                alt={c.author?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-800">{c.author?.name}</p>
                  {user && (user._id === c.author?._id || user.role !== 'user') && (
                    <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-500">
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
