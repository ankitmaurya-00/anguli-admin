import axios from 'axios';

let API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || 'https://anguli-backend.onrender.com/api';
if (typeof API_URL === 'string') {
  API_URL = API_URL.replace(/\/+$/, '');
  if (!API_URL.endsWith('/api')) API_URL += '/api';
}

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('anguli_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('anguli_admin_token');
      localStorage.removeItem('anguli_admin_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
