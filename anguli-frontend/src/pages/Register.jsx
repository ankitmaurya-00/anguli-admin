import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', state: '', district: '', village: '' });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/states').then((res) => setStates(res.data.states)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.state) {
      api.get(`/states/${form.state}/districts`).then((res) => setDistricts(res.data.districts)).catch(() => {});
      setForm((f) => ({ ...f, district: '', village: '' }));
      setVillages([]);
    }
  }, [form.state]);

  useEffect(() => {
    if (form.district) {
      api.get(`/districts/${form.district}/villages`).then((res) => setVillages(res.data.villages)).catch(() => {});
      setForm((f) => ({ ...f, village: '' }));
    }
  }, [form.district]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Anguli.in');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Join Anguli.in</h1>
        <p className="text-gray-500 text-sm mb-6">Apni community se judne ke liye account banayein</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
              placeholder="Aapka naam"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
              placeholder="aapka@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
              placeholder="Kam se kam 6 characters"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 -mb-1">Apna location select karein (optional)</p>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 text-sm"
            >
              <option value="">State chunein</option>
              {states.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              disabled={!form.state}
              className="border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 text-sm disabled:bg-gray-50"
            >
              <option value="">District chunein</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <select
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              disabled={!form.district}
              className="border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 text-sm disabled:bg-gray-50"
            >
              <option value="">Village chunein</option>
              {villages.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Pehle se account hai? <Link to="/login" className="text-primary-600 font-medium hover:underline">Login karein</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
