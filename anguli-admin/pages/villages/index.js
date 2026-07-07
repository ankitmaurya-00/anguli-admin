import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import ProtectedPage from '../../components/ProtectedPage';
import api from '../../utils/api';

export default function MasterData() {
  const [tab, setTab] = useState('states');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, d, v] = await Promise.all([
        api.get('/admin/states'),
        api.get('/admin/districts'),
        api.get('/admin/villages', { params: { limit: 100 } }),
      ]);
      setStates(s.data.states);
      setDistricts(d.data.districts);
      setVillages(v.data.villages);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item || {});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm({});
  };

  const handleSave = async () => {
    try {
      if (tab === 'states') {
        if (editing) await api.put(`/admin/states/${editing._id}`, form);
        else await api.post('/admin/states', form);
      } else if (tab === 'districts') {
        if (!form.state) return toast.error('Please select a state');
        if (editing) await api.put(`/admin/districts/${editing._id}`, form);
        else await api.post('/admin/districts', form);
      } else {
        if (!form.district) return toast.error('Please select a district');
        if (editing) await api.put(`/admin/villages/${editing._id}`, form);
        else await api.post('/admin/villages', form);
      }
      toast.success(editing ? 'Update ho gaya' : 'Add ho gaya');
      closeModal();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete?')) return;
    try {
      await api.delete(`/admin/${tab}/${id}`);
      toast.success('Deleted');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const currentList = tab === 'states' ? states : tab === 'districts' ? districts : villages;

  return (
    <ProtectedPage>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Core Master Data</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          <FiPlus /> Add New
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['states', 'districts', 'villages'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              tab === t ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {t} ({t === 'states' ? states.length : t === 'districts' ? districts.length : villages.length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              {tab !== 'states' && <th className="px-4 py-3">Parent</th>}
              {tab === 'villages' && <th className="px-4 py-3">Population</th>}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : currentList.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No data available</td></tr>
            ) : (
              currentList.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  {tab === 'districts' && <td className="px-4 py-3 text-gray-600">{item.state?.name}</td>}
                  {tab === 'villages' && <td className="px-4 py-3 text-gray-600">{item.district?.name}, {item.state?.name}</td>}
                  {tab === 'villages' && <td className="px-4 py-3 text-gray-600">{item.population || '-'}</td>}
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openModal(item)} className="text-primary-600 hover:text-primary-800"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800 capitalize">{editing ? 'Edit' : 'Add'} {tab.slice(0, -1)}</h2>
              <button onClick={closeModal}><FiX /></button>
            </div>

            <div className="space-y-3">
              <input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
              />

              {tab === 'states' && (
                <input
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="State Code (e.g. UP)"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                />
              )}

              {tab === 'districts' && (
                <select
                  value={form.state || ''}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                >
                  <option value="">Select state</option>
                  {states.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              )}

              {tab === 'villages' && (
                <>
                  <select
                    value={form.district || ''}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.state?.name})</option>)}
                  </select>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                  />
                  <input
                    type="number"
                    value={form.population || ''}
                    onChange={(e) => setForm({ ...form, population: e.target.value })}
                    placeholder="Population"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                  />
                  <input
                    value={form.pincode || ''}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="Pincode"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={form.isFeatured || false}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    />
                    Featured village
                  </label>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg mt-5"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
