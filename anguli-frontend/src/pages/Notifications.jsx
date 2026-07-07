import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiUserPlus, FiBell } from 'react-icons/fi';
import api from '../api/axios';

const iconFor = (type) => {
  switch (type) {
    case 'like': return <FiHeart className="text-red-500" />;
    case 'comment': return <FiMessageCircle className="text-primary-600" />;
    case 'share': return <FiShare2 className="text-accent-600" />;
    case 'follow': return <FiUserPlus className="text-purple-600" />;
    default: return <FiBell className="text-gray-500" />;
  }
};

const linkFor = (n) => {
  if (n.targetType === 'Post') return `/posts/${n.targetId}`;
  if (n.targetType === 'User') return `/profile/${n.targetId}`;
  return '#';
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/notifications').then((res) => setNotifications(res.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await api.put(`/notifications/${n._id}/read`);
      setNotifications(notifications.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-primary-600 font-medium hover:underline">Mark all as read</button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-16 bg-white rounded-xl border border-gray-100">No notifications.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={linkFor(n)}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 p-4 hover:bg-gray-50 ${!n.isRead ? 'bg-primary-50/50' : ''}`}
            >
              <div className="mt-1">{iconFor(n.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-primary-600 rounded-full mt-2" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
