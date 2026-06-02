import { Eye, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'alvin-superadmin', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/admin');
    } catch {
      setError('Username atau password superadmin tidak sesuai.');
    }
  }

  return (
    <AuthShell title="Superadmin">
      <form onSubmit={submit} className="space-y-4">
        <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
          <User size={18} className="text-elBlue" />
          <input className="w-full bg-transparent outline-none" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
          <Lock size={18} className="text-elBlue" />
          <input className="w-full bg-transparent outline-none" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Eye size={17} className="text-slate-400" />
        </label>
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <button className="w-full rounded-2xl bg-gradient-to-r from-sky-400 via-elBlue to-violet-600 py-3 font-black text-white shadow-soft">Login Superadmin</button>
      </form>
    </AuthShell>
  );
}
