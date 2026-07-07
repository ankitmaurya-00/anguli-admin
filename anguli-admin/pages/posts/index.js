import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiTrash2, FiFlag, FiStar } from 'react-icons/fi';
import ProtectedPage from '../../components/ProtectedPage';
import api from '../../utils/api';

export default function PostsModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadPosts = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filter === 'reported') params.reported = 'true';
    if (filter === 'hidden') params.hidden = 'true';
    api
      .get('/admin/posts', { params })
      .then((res) => {
        setPosts(res.data.posts);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, [filter, page]);

  const toggleHide = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/toggle-hide`);
      loadPosts();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const togglePin = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/toggle-pin`);
      loadPosts();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const deletePost = async (id) => {
    if (!confirm('Ye post permanently delete karna hai?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success('Post deleted');
      loadPosts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <ProtectedPage>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Moderation</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'reported', label: 'Reported' },
          { key: 'hidden', label: 'Hidden' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              filter === f.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No posts</p>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{p.author?.name} <span className="text-gray-400 font-normal">({p.author?.email})</span></p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{p.content || `[${p.postType} post]`}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>{p.likesCount} likes</span>
                  <span>{p.commentsCount} comments</span>
                  {p.isReported && <span className="text-red-500 flex items-center gap-1"><FiFlag size={11} /> {p.reportsCount} reports</span>}
                  {p.isHidden && <span className="text-gray-500">Hidden</span>}
                  {p.isPinned && <span className="text-amber-500">Pinned</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => togglePin(p._id)} title="Pin/Unpin" className={`p-2 rounded-lg ${p.isPinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FiStar size={14} />
                </button>
                <button onClick={() => toggleHide(p._id)} title="Hide/Unhide" className={`p-2 rounded-lg ${p.isHidden ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isHidden ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
                <button onClick={() => deletePost(p._id)} title="Delete" className="p-2 rounded-lg bg-red-100 text-red-600">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm font-medium ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </ProtectedPage>
  );
}
