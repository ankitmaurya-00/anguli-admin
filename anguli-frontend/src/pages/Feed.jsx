import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchFeed = (type, p) => {
    setLoading(true);
    const params = { page: p, limit: 10 };
    if (type === 'following') params.feed = 'following';
    api
      .get('/posts/feed', { params })
      .then((res) => {
        setPosts(res.data.posts);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed(feedType, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType, page]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Community Feed</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'following', label: 'Following' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setFeedType(f.key); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              feedType === f.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <CreatePostBox onPostCreated={handlePostCreated} />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No posts yet. Be the first to post!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} onUpdate={() => fetchFeed(feedType, page)} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
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
    </div>
  );
};

export default Feed;
