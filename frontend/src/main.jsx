import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminProtected({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/admin-login" replace />;
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? children : <Navigate to="/" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Protected><ChatPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="/admin" element={<AdminProtected><AdminPage /></AdminProtected>} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
