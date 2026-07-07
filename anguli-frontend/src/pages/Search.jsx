import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'villages');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePostUpdate = (postId, updatedPost) => {
    setResults((prev) =>
      updatedPost
        ? prev.map((item) => (item._id === postId ? updatedPost : item))
        : prev.filter((item) => item._id !== postId)
    );
  };

  const runSearch = (q, t) => {
    setLoading(true);
    api
      .get('/search', { params: { q, type: t } })
      .then((res) => setResults(res.data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const t = searchParams.get('type') || 'villages';
    setQuery(q);
    setType(t);
    runSearch(q, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, type });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Anguli.in</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search village, user, or post..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
        />
        <button type="submit" className="bg-primary-600 text-white px-5 rounded-lg flex items-center gap-2 font-medium hover:bg-primary-700">
          <FiSearch /> Search
        </button>
      </form>

      <div className="flex gap-2 mb-6">
        {['villages', 'users', 'posts'].map((t) => (
          <button
            key={t}
            onClick={() => setSearchParams({ q: query, type: t })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              type === t ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Searching...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No results found. Try a different search.</p>
      ) : type === 'villages' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((v) => (
            <Link key={v._id} to={`/villages/${v.slug}`} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm">
              <h3 className="font-semibold text-gray-800">{v.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FiMapPin size={13} /> {v.district?.name}, {v.state?.name}</p>
            </Link>
          ))}
        </div>
      ) : type === 'users' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((u) => (
            <Link key={u._id} to={`/profile/${u._id}`} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm">
              <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`} className="w-12 h-12 rounded-full object-cover" alt={u.name} />
              <div>
                <h3 className="font-semibold text-gray-800">{u.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1"><FiUsers size={12} /> {u.followersCount || 0} followers</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((p) => (
            <PostCard key={p._id} post={p} onUpdate={(updatedPost) => handlePostUpdate(p._id, updatedPost)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
