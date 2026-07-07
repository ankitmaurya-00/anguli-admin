import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    facebook: user?.socialLinks?.facebook || '',
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
    website: user?.socialLinks?.website || '',
  });
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(user?.profilePicture || '');
  const [saving, setSaving] = useState(false);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicFile(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (picFile) {
        const formData = new FormData();
        formData.append('image', picFile);
        const res = await api.put('/users/me/profile-picture', formData);
        updateUserState({ profilePicture: res.data.profilePicture });
      }

      const res = await api.put('/users/me', {
        name: form.name,
        bio: form.bio,
        socialLinks: {
          facebook: form.facebook,
          instagram: form.instagram,
          twitter: form.twitter,
          website: form.website,
        },
      });
      updateUserState(res.data.user);
      toast.success('Profile update ho gaya!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex flex-col items-center">
          <img
            src={picPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=2563eb&color=fff&size=128`}
            className="w-24 h-24 rounded-full object-cover border mb-2"
            alt="profile"
          />
          <label className="text-sm text-primary-600 font-medium cursor-pointer hover:underline">
            Photo badlein
            <input type="file" accept="image/*" hidden onChange={handlePicChange} />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={300}
            rows={3}
            className="w-full mt-1 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
            placeholder="Apne baare me kuch likhein..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            placeholder="Facebook URL"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500"
          />
          <input
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="Instagram URL"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500"
          />
          <input
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            placeholder="Twitter/X URL"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500"
          />
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="Website URL"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
