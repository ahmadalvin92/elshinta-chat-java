import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('elshinta_token'));
  const [user, setUserState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('elshinta_user') || 'null');
    } catch {
      localStorage.removeItem('elshinta_user');
      localStorage.removeItem('elshinta_token');
      return null;
    }
  });

  const value = useMemo(() => ({
    token: user ? token : null,
    user,
    setUser: (next) => {
      setUserState(next);
      localStorage.setItem('elshinta_user', JSON.stringify(next));
    },
    async login(payload) {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('elshinta_token', data.token);
      localStorage.setItem('elshinta_user', JSON.stringify(data.user));
      setToken(data.token);
      setUserState(data.user);
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('elshinta_token', data.token);
      localStorage.setItem('elshinta_user', JSON.stringify(data.user));
      setToken(data.token);
      setUserState(data.user);
      return data;
    },
    async logout() {
      try {
        await api.post('/auth/logout');
      } finally {
        localStorage.removeItem('elshinta_token');
        localStorage.removeItem('elshinta_user');
        setToken(null);
        setUserState(null);
      }
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
