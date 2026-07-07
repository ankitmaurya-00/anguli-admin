import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleBookmarkUpdate = (bookmarkId, updatedPost) => {
    setBookmarks((prev) =>
      updatedPost
        ? prev.map((item) => (item._id === bookmarkId ? { ...item, post: updatedPost } : item))
        : prev.filter((item) => item._id !== bookmarkId)
    );
  };

  useEffect(() => {
    api.get('/posts/bookmarks/me').then((res) => setBookmarks(res.data.bookmarks)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Posts</h1>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-gray-500 text-center py-16 bg-white rounded-xl border border-gray-100">No saved posts.</p>
      ) : (
        <div className="space-y-4">
          {bookmarks.filter((b) => b.post).map((b) => (
            <PostCard key={b._id} post={b.post} onUpdate={(updatedPost) => handleBookmarkUpdate(b._id, updatedPost)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
