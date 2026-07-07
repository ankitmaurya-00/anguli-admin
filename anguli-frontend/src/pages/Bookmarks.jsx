import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/bookmarks/me').then((res) => setBookmarks(res.data.bookmarks)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Posts</h1>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-gray-500 text-center py-16 bg-white rounded-xl border border-gray-100">Koi saved post nahi hai.</p>
      ) : (
        <div className="space-y-4">
          {bookmarks.filter((b) => b.post).map((b) => (
            <PostCard key={b._id} post={b.post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
