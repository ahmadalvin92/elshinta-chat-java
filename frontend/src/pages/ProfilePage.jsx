import { ArrowLeft, Camera, Lock, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mediaUrl } from '../api/client.js';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({ fullName: user?.fullName || '', divisionId: '', statusMessage: user?.statusMessage || '' });
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    api.get('/public/divisions').then(({ data }) => setDivisions(data));
  }, []);

  async function save() {
    const { data } = await api.put('/profile', { ...form, divisionId: Number(form.divisionId) });
    setUser(data);
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('avatar', file);
    const { data } = await api.post('/profile/avatar', body);
    setUser(data);
  }

  async function changePassword() {
    await api.post('/profile/password', password);
    setPassword({ oldPassword: '', newPassword: '' });
  }

  return (
    <main className="app-shell">
      <div className="glass mx-auto max-w-4xl rounded-[32px] p-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="rounded-2xl bg-white/75 p-3 text-elBlue"><ArrowLeft /></Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
          <section className="rounded-[28px] bg-gradient-to-br from-elBlue to-violet-600 p-6 text-center text-white shadow-soft">
            <img src={mediaUrl(user?.avatarUrl) || '/favicon.png'} alt={user?.fullName} className="mx-auto h-32 w-32 rounded-full border-4 border-white object-cover" />
            <button onClick={() => fileRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-3 font-bold"><Camera size={18} /> Change Avatar</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            <p className="mt-4 text-sm">Max 5 MB</p>
          </section>
          <section className="space-y-4">
            <Input label="Nama lengkap" value={form.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Divisi</span>
              <select className="mt-2 w-full rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 outline-none" value={form.divisionId} onChange={(e) => setForm({ ...form, divisionId: e.target.value })}>
                <option value="">Pilih divisi</option>
                {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
              </select>
            </label>
            <Input label="Status message" value={form.statusMessage} onChange={(statusMessage) => setForm({ ...form, statusMessage })} />
            <button onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-elBlue px-5 py-3 font-black text-white"><Save size={18} /> Save Profile</button>
            <div className="rounded-3xl bg-white/65 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-black text-elBlueDark"><Lock size={18} /> Change Password</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Password lama" type="password" value={password.oldPassword} onChange={(oldPassword) => setPassword({ ...password, oldPassword })} />
                <Input label="Password baru" type="password" value={password.newPassword} onChange={(newPassword) => setPassword({ ...password, newPassword })} />
              </div>
              <button onClick={changePassword} className="mt-4 rounded-2xl bg-elGreen px-5 py-3 font-black text-white">Update Password</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <input className="mt-2 w-full rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 outline-none" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
    </label>
  );
}
