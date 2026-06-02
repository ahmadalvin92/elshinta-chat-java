import { Link, useNavigate } from 'react-router-dom';
import { Camera, KeyRound, Lock, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({ fullName: '', username: '', password: '', divisionId: '', accessCode: '' });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/public/divisions').then(({ data }) => setDivisions(data)).catch(() => setDivisions([]));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await register({ ...form, divisionId: Number(form.divisionId) });
      if (avatar) {
        const body = new FormData();
        body.append('avatar', avatar);
        await api.post('/profile/avatar', body);
      }
      navigate('/');
    } catch {
      setError('Registrasi gagal. Periksa kode akses internal.');
    }
  }

  return (
    <AuthShell title="Create Account">
      <form onSubmit={submit} className="space-y-3">
        <Field icon={<User size={18} />} placeholder="Nama lengkap" value={form.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
        <Field icon={<User size={18} />} placeholder="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} />
        <Field icon={<Lock size={18} />} placeholder="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
          <Users size={18} className="text-elBlue" />
          <select className="w-full bg-transparent outline-none" value={form.divisionId} onChange={(e) => setForm({ ...form, divisionId: e.target.value })}>
            <option value="">Pilih divisi</option>
            {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
          </select>
        </label>
        <Field icon={<KeyRound size={18} />} placeholder="Kode akses internal" value={form.accessCode} onChange={(accessCode) => setForm({ ...form, accessCode })} />
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-white/60 px-4 py-3 text-sm font-bold text-elBlue">
          <Camera size={18} />
          <span>{avatar ? avatar.name : 'Upload avatar optional, max 5 MB'}</span>
          <input className="hidden" type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
        </label>
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <button className="w-full rounded-2xl bg-gradient-to-r from-sky-400 via-elBlue to-violet-600 py-3 font-black text-white shadow-soft">Register</button>
        <p className="text-center text-sm text-slate-500">Sudah punya akun? <Link className="font-bold text-elBlue" to="/login">Login</Link></p>
      </form>
    </AuthShell>
  );
}

function Field({ icon, value, onChange, ...props }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
      <span className="text-elBlue">{icon}</span>
      <input className="w-full bg-transparent outline-none" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
    </label>
  );
}
