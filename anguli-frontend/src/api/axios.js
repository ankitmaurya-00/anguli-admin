import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (typeof API_URL === 'string') {
  API_URL = API_URL.trim().replace(/\/+$/, '');
  if (!API_URL.endsWith('/api')) API_URL += '/api';
}

const api = axios.create({ baseURL: API_URL, timeout: 30000, maxContentLength: 200 * 1024 * 1024, maxBodyLength: 200 * 1024 * 1024 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anguli_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anguli_token');
      localStorage.removeItem('anguli_user');
    }
    return Promise.reject(error);
  }
);

export default api;
