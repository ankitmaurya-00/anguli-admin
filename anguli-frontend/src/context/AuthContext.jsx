import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('anguli_token');
      const cachedUser = localStorage.getItem('anguli_user');
      if (cachedUser) setUser(JSON.parse(cachedUser));

      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('anguli_user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('anguli_token');
          localStorage.removeItem('anguli_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('anguli_token', res.data.token);
    localStorage.setItem('anguli_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    // sanitize optional location fields: if blank or not provided, omit them
    const data = { ...payload };
    ['state', 'district', 'village'].forEach((k) => {
      if (!data[k]) delete data[k];
    });
    const res = await api.post('/auth/register', data);
    localStorage.setItem('anguli_token', res.data.token);
    localStorage.setItem('anguli_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('anguli_token');
    localStorage.removeItem('anguli_user');
    setUser(null);
  };

  const updateUserState = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('anguli_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserState, isAdmin: user?.role === 'admin' || user?.role === 'moderator' }}>
      {children}
    </AuthContext.Provider>
  );
};
