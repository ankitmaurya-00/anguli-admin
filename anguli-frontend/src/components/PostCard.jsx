import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return 'just now';
};

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    try {
      const res = await api.post(`/posts/${post._id}/like`, { targetType: 'Post' });
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      toast.error('Could not like post');
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Could not bookmark post');
    }
  };

  const handleShare = async () => {
    if (!requireAuth()) return;
    try {
      await api.post(`/posts/${post._id}/share`);
      toast.success('Post shared');
      onUpdate && onUpdate();
    } catch (err) {
      toast.error('Could not share post');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3">
          <img
            src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=2563eb&color=fff`}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-800 text-sm">{post.author?.name}</p>
            <p className="text-xs text-gray-500">
              {post.village?.name && `${post.village.name} · `}{timeAgo(post.createdAt)}{post.isEdited && ' · edited'}
            </p>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-gray-600"><FiMoreHorizontal /></button>
      </div>

      {post.content && <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.content}</p>}

      {post.media && post.media.length > 0 && (
        <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.media.map((m, idx) =>
            m.type === 'video' ? (
              <video key={idx} src={m.url} controls className="rounded-lg w-full max-h-96 object-cover" />
            ) : (
              <img key={idx} src={m.url} alt="post media" className="rounded-lg w-full max-h-96 object-cover" />
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <button onClick={handleLike} className={`flex items-center gap-1.5 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
          <FiHeart className={isLiked ? 'fill-current' : ''} /> {likesCount}
        </button>
        <Link to={`/posts/${post._id}`} className="flex items-center gap-1.5 hover:text-primary-600">
          <FiMessageCircle /> {post.commentsCount || 0}
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-accent-600">
          <FiShare2 /> {post.sharesCount || 0}
        </button>
        <button onClick={handleBookmark} className={isBookmarked ? 'text-amber-500' : 'hover:text-amber-500'}>
          <FiBookmark className={isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
