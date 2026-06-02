import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('elshinta_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('elshinta_user') || 'null'));

  const value = useMemo(() => ({
    token,
    user,
    setUser: (next) => {
      setUser(next);
      localStorage.setItem('elshinta_user', JSON.stringify(next));
    },
    async login(payload) {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('elshinta_token', data.token);
      localStorage.setItem('elshinta_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('elshinta_token', data.token);
      localStorage.setItem('elshinta_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    async logout() {
      try {
        await api.post('/auth/logout');
      } finally {
        localStorage.removeItem('elshinta_token');
        localStorage.removeItem('elshinta_user');
        setToken(null);
        setUser(null);
      }
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
