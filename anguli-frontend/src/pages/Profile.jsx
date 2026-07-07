import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiEdit2 } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isOwnProfile = currentUser && currentUser._id === id;

  const loadProfile = () => {
    setLoading(true);
    Promise.all([api.get(`/users/${id}`), api.get(`/users/${id}/posts`)])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (tab === 'followers') {
      api.get(`/users/${id}/followers`).then((res) => setFollowers(res.data.followers));
    } else if (tab === 'following') {
      api.get(`/users/${id}/following`).then((res) => setFollowing(res.data.following));
    }
  }, [tab, id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  if (!profile) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">User nahi mila.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-br from-primary-600 to-accent-500" style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover' } : {}} />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10">
            <img
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563eb&color=fff&size=128`}
              alt={profile.name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
            />
            {isOwnProfile ? (
              <Link to="/profile/me/edit" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50">
                <FiEdit2 size={13} /> Edit Profile
              </Link>
            ) : (
              <FollowButton userId={profile._id} initialIsFollowing={profile.isFollowing} onChange={loadProfile} />
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-800 mt-3">{profile.name}</h1>
          {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
          {profile.village?.name && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FiMapPin size={13} /> {profile.village.name}, {profile.district?.name}, {profile.state?.name}
            </p>
          )}

          <div className="flex gap-6 mt-4 text-sm">
            <button onClick={() => setTab('posts')} className={`font-medium ${tab === 'posts' ? 'text-primary-600' : 'text-gray-500'}`}>
              {profile.postsCount || 0} Posts
            </button>
            <button onClick={() => setTab('followers')} className={`font-medium ${tab === 'followers' ? 'text-primary-600' : 'text-gray-500'}`}>
              {profile.followersCount || 0} Followers
            </button>
            <button onClick={() => setTab('following')} className={`font-medium ${tab === 'following' ? 'text-primary-600' : 'text-gray-500'}`}>
              {profile.followingCount || 0} Following
            </button>
          </div>
        </div>
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-white rounded-xl border border-gray-100">Abhi koi post nahi hai.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )
      )}

      {tab === 'followers' && (
        <div className="bg-white rounded-xl border border-gray-100 divide-y">
          {followers.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Koi followers nahi hain.</p>
          ) : followers.map((f) => (
            <Link key={f._id} to={`/profile/${f._id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50">
              <img src={f.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=2563eb&color=fff`} className="w-10 h-10 rounded-full object-cover" alt={f.name} />
              <span className="font-medium text-gray-800">{f.name}</span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'following' && (
        <div className="bg-white rounded-xl border border-gray-100 divide-y">
          {following.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Kisi ko follow nahi kiya hai.</p>
          ) : following.map((f) => (
            <Link key={f._id} to={`/profile/${f._id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50">
              <img src={f.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=2563eb&color=fff`} className="w-10 h-10 rounded-full object-cover" alt={f.name} />
              <span className="font-medium text-gray-800">{f.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
