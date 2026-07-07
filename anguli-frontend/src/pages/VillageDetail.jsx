import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiUsers, FiFileText } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const VillageDetail = () => {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/villages/${slug}`)
      .then((res) => {
        setVillage(res.data.village);
        return api.get('/posts/feed', { params: { village: res.data.village._id, limit: 10 } });
      })
      .then((res) => setPosts(res?.data?.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  }

  if (!village) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Village nahi mila.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
          {village.coverImage ? (
            <img src={village.coverImage} alt={village.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl font-bold text-white/40">{village.name[0]}</span>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">{village.name}</h1>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <FiMapPin size={14} /> <Link to={`/villages?district=${village.district?._id}`} className="hover:underline">{village.district?.name}</Link>, {village.state?.name}
          </p>

          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><FiUsers /> {village.membersCount || 0} members</span>
            <span className="flex items-center gap-1.5"><FiFileText /> {village.postsCount || 0} posts</span>
            {village.population > 0 && <span>Population: {village.population.toLocaleString()}</span>}
            {village.pincode && <span>Pincode: {village.pincode}</span>}
          </div>

          {village.description && <p className="text-gray-700 mt-4 leading-relaxed">{village.description}</p>}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Posts from {village.name}</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm bg-white rounded-xl border border-gray-100 p-6 text-center">
          Is village se abhi tak koi post nahi hai. Sabse pehle post karein!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VillageDetail;
