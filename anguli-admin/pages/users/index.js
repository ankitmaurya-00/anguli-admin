import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiUserCheck, FiUserX, FiShield } from 'react-icons/fi';
import ProtectedPage from '../../components/ProtectedPage';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadUsers = () => {
    setLoading(true);
    api
      .get('/admin/users', { params: { search, page, limit: 15 } })
      .then((res) => {
        setUsers(res.data.users);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const toggleBan = async (user) => {
    try {
      if (user.isBanned) {
        await api.put(`/admin/users/${user._id}/unban`);
        toast.success('User unbanned');
      } else {
        const reason = prompt('Ban reason (optional):') || 'Violation of community guidelines';
        await api.put(`/admin/users/${user._id}/ban`, { reason });
        toast.success('User banned');
      }
      loadUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const changeRole = async (user, role) => {
    try {
      await api.put(`/admin/users/${user._id}/role`, { role });
      toast.success('Role updated');
      loadUsers();
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  return (
    <ProtectedPage>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Users Management</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
        />
        <button type="submit" className="bg-primary-600 text-white px-4 rounded-lg flex items-center gap-2">
          <FiSearch /> Search
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Banned</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBan(u)}
                      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${
                        u.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.isBanned ? <FiUserCheck size={12} /> : <FiUserX size={12} />}
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
    </ProtectedPage>
  );
}
