import React, { useEffect, useState } from 'react';
import { FiUsers, FiFileText, FiMapPin, FiFlag, FiUserX, FiTrendingUp } from 'react-icons/fi';
import ProtectedPage from '../components/ProtectedPage';
import api from '../utils/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '-'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.stats)).catch(() => {});
  }, []);

  return (
    <ProtectedPage>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FiUsers} label="Total Users" value={stats?.totalUsers} color="bg-primary-600" />
        <StatCard icon={FiFileText} label="Total Posts" value={stats?.totalPosts} color="bg-accent-600 bg-green-600" />
        <StatCard icon={FiMapPin} label="Total Villages" value={stats?.totalVillages} color="bg-amber-500" />
        <StatCard icon={FiFlag} label="Pending Reports" value={stats?.pendingReports} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FiMapPin} label="States" value={stats?.totalStates} color="bg-indigo-500" />
        <StatCard icon={FiMapPin} label="Districts" value={stats?.totalDistricts} color="bg-teal-500" />
        <StatCard icon={FiUserX} label="Banned Users" value={stats?.bannedUsers} color="bg-gray-600" />
        <StatCard icon={FiTrendingUp} label="New Users (7d)" value={stats?.newUsersThisWeek} color="bg-pink-500" />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-2">This Week</h2>
        <p className="text-sm text-gray-600">
          {stats?.newUsersThisWeek ?? 0} new users aur {stats?.newPostsThisWeek ?? 0} new posts pichle 7 dino me aaye hain.
        </p>
      </div>
    </ProtectedPage>
  );
}
