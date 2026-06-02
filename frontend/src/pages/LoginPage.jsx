import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { guest } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await guest(fullName);
      navigate('/');
    } catch {
      setError('Nama minimal 2 karakter.');
    }
  }

  return (
    <AuthShell title="Masuk Chat">
      <form onSubmit={submit} className="space-y-4">
        <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
          <User size={18} className="text-elBlue" />
          <input className="w-full bg-transparent outline-none" placeholder="Masukkan nama Anda" value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
        </label>
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <button className="w-full rounded-2xl bg-gradient-to-r from-sky-400 via-elBlue to-violet-600 py-3 font-black text-white shadow-soft">Masuk Chat</button>
        <p className="text-center text-sm text-slate-500">Admin? <Link className="font-bold text-elBlue" to="/admin-login">Login Superadmin</Link></p>
      </form>
    </AuthShell>
  );
}
