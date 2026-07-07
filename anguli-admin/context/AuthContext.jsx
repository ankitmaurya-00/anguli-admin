import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('anguli_admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.user.role !== 'admin' && res.data.user.role !== 'moderator') {
          throw new Error('Not an admin');
        }
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem('anguli_admin_token');
        localStorage.removeItem('anguli_admin_user');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.user.role !== 'admin' && res.data.user.role !== 'moderator') {
      throw new Error('You do not have admin panel access');
    }
    localStorage.setItem('anguli_admin_token', res.data.token);
    localStorage.setItem('anguli_admin_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('anguli_admin_token');
    localStorage.removeItem('anguli_admin_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
