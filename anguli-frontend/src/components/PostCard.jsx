import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiEdit2, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';
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
  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');

  useEffect(() => {
    setCurrentPost(post);
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likesCount || 0);
    setIsBookmarked(post.isBookmarked || false);
    setEditContent(post.content || '');
  }, [post]);

  const authorId = currentPost?.author?._id || currentPost?.author;
  const isOwner = user && authorId?.toString() === user._id?.toString();

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
      const res = await api.post(`/posts/${currentPost._id}/like`, { targetType: 'Post' });
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      toast.error('Could not like post');
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try {
      const res = await api.post(`/posts/${currentPost._id}/bookmark`);
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Could not bookmark post');
    }
  };

  const handleShare = async () => {
    if (!requireAuth()) return;
    try {
      await api.post(`/posts/${currentPost._id}/share`);
      toast.success('Post shared');
      onUpdate && onUpdate();
    } catch (err) {
      toast.error('Could not share post');
    }
  };

  const handleSaveEdit = async () => {
    if (!isOwner) return;
    try {
      const res = await api.put(`/posts/${currentPost._id}`, { content: editContent });
      setCurrentPost(res.data.post);
      setIsEditing(false);
      toast.success('Post updated');
      onUpdate && onUpdate(res.data.post);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update post');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(currentPost.content || '');
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${currentPost._id}`);
      toast.success('Post deleted');
      if (onUpdate) {
        onUpdate();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${currentPost.author?._id}`} className="flex items-center gap-3">
          <img
            src={currentPost.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPost.author?.name || 'U')}&background=2563eb&color=fff`}
            alt={currentPost.author?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-800 text-sm">{currentPost.author?.name}</p>
            <p className="text-xs text-gray-500">
              {currentPost.village?.name && `${currentPost.village.name} · `}{timeAgo(currentPost.createdAt)}{currentPost.isEdited && ' · edited'}
            </p>
          </div>
        </Link>
        {isOwner ? (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSaveEdit} className="text-primary-600 hover:text-primary-800" title="Save changes">
                  <FiSave />
                </button>
                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600" title="Cancel edit">
                  <FiXCircle />
                </button>
                <button onClick={handleDelete} className="text-red-500 hover:text-red-600" title="Delete post">
                  <FiTrash2 />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-gray-600" title="Edit post">
                  <FiEdit2 />
                </button>
                <button onClick={handleDelete} className="text-red-500 hover:text-red-600" title="Delete post">
                  <FiTrash2 />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-gray-400"><FiMoreHorizontal /></div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:border-primary-500 focus:outline-none"
            placeholder="Update your post..."
          />
        </div>
      ) : (
        currentPost.content && <p className="mt-3 text-gray-800 whitespace-pre-wrap">{currentPost.content}</p>
      )}

      {currentPost.media && currentPost.media.length > 0 && (
        <div className={`mt-3 grid gap-2 ${currentPost.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {currentPost.media.map((m, idx) =>
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
        <Link to={`/posts/${currentPost._id}`} className="flex items-center gap-1.5 hover:text-primary-600">
          <FiMessageCircle /> {currentPost.commentsCount || 0}
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-accent-600">
          <FiShare2 /> {currentPost.sharesCount || 0}
        </button>
        <button onClick={handleBookmark} className={isBookmarked ? 'text-amber-500' : 'hover:text-amber-500'}>
          <FiBookmark className={isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
