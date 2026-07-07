import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProtectedPage from '../../components/ProtectedPage';
import api from '../../utils/api';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  dismissed: 'bg-gray-100 text-gray-600',
  action_taken: 'bg-green-100 text-green-700',
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    setLoading(true);
    api.get('/admin/reports', { params: filter ? { status: filter } : {} }).then((res) => setReports(res.data.reports)).finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      toast.success('Status updated');
      loadReports();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <ProtectedPage>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Reports</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'reviewed', 'dismissed', 'action_taken', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No reports</p>
        ) : (
          reports.map((r) => (
            <div key={r._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {r.targetType} reported for <span className="capitalize">{r.reason}</span>
                </p>
                {r.details && <p className="text-sm text-gray-600 mt-1">{r.details}</p>}
                <p className="text-xs text-gray-400 mt-1">Reported by {r.reporter?.name} · {new Date(r.createdAt).toLocaleString()}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r._id, e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs h-fit"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
                <option value="action_taken">Action Taken</option>
              </select>
            </div>
          ))
        )}
      </div>
    </ProtectedPage>
  );
}
