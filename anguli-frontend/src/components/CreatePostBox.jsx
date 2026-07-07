import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiImage, FiVideo, FiX } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })));
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error('Kuch likhein ya media add karein');
      return;
    }
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      files.forEach((f) => formData.append('media', f));
      if (user?.village) formData.append('village', user.village._id || user.village);

      const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post created!');
      setContent('');
      setFiles([]);
      setPreviews([]);
      onPostCreated && onPostCreated(res.data.post);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Post create nahi ho paya');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex gap-3">
        <img
          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff`}
          alt="you"
          className="w-10 h-10 rounded-full object-cover"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Aapke gaon me kya ho raha hai? Share karein..."
          className="flex-1 resize-none border-0 focus:ring-0 text-gray-800 placeholder-gray-400 outline-none"
          rows={2}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((p, idx) => (
            <div key={idx} className="relative">
              {p.type === 'video' ? (
                <video src={p.url} className="w-full h-24 object-cover rounded-lg" />
              ) : (
                <img src={p.url} className="w-full h-24 object-cover rounded-lg" alt="preview" />
              )}
              <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <label className="flex items-center gap-2 text-gray-500 hover:text-primary-600 cursor-pointer text-sm">
          <FiImage /> Photo/Video
          <input type="file" accept="image/*,video/*" multiple hidden onChange={handleFileChange} />
        </label>
        <button
          onClick={handleSubmit}
          disabled={posting}
          className="bg-primary-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostBox;
