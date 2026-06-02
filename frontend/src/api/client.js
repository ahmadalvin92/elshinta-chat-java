import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('elshinta_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function mediaUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

