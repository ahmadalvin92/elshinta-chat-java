import { ArrowLeft, Megaphone, Plus, Save, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Logo from '../components/Logo.jsx';

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [divisionName, setDivisionName] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', body: '' });
  const [announcementStatus, setAnnouncementStatus] = useState('');

  function load() {
    api.get('/admin/dashboard').then(({ data }) => setDashboard(data));
    api.get('/admin/divisions').then(({ data }) => setDivisions(data));
    api.get('/admin/users').then(({ data }) => setUsers(data));
    api.get('/admin/rooms').then(({ data }) => setRooms(data));
    api.get('/admin/announcements').then(({ data }) => setLatestAnnouncements(data));
  }

  useEffect(load, []);

  async function addDivision() {
    if (!divisionName) return;
    await api.post('/admin/divisions', { name: divisionName, active: true });
    setDivisionName('');
    load();
  }

  async function sendAnnouncement() {
    if (!announcement.title.trim() || !announcement.body.trim()) {
      setAnnouncementStatus('Judul dan pesan wajib diisi.');
      return;
    }
    setAnnouncementStatus('Mengirim...');
    try {
      await api.post('/admin/announcements', announcement);
      setAnnouncement({ title: '', body: '' });
      setAnnouncementStatus('Pengumuman berhasil dikirim ke semua user.');
      load();
    } catch {
      setAnnouncementStatus('Pengumuman gagal dikirim. Cek login admin dan koneksi backend.');
    }
  }

  return (
    <main className="app-shell">
      <div className="glass mx-auto max-w-6xl rounded-[32px] p-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="rounded-2xl bg-white/75 p-3 text-elBlue"><ArrowLeft /></Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Total User" value={dashboard?.totalUser || 0} />
          <Stat label="Total Room" value={dashboard?.totalRoom || 0} />
          <Stat label="User Online" value={dashboard?.userOnline || 0} />
          <Stat label="Announcement" value={dashboard?.totalAnnouncement || 0} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel icon={<Shield />} title="Master Divisi">
            <div className="mb-4 flex gap-2">
              <input className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-white/75 px-4 py-3 outline-none" placeholder="Nama divisi" value={divisionName} onChange={(e) => setDivisionName(e.target.value)} />
              <button onClick={addDivision} className="rounded-2xl bg-elBlue p-3 text-white"><Plus /></button>
            </div>
            <div className="space-y-2">
              {divisions.map((division) => <Row key={division.id} left={division.name} right={division.active ? 'Aktif' : 'Nonaktif'} />)}
            </div>
          </Panel>
          <Panel icon={<Users />} title="Manage User">
            <div className="space-y-2">
              {users.map((item) => <Row key={item.id} left={item.fullName} sub={item.username} right={item.role} />)}
            </div>
          </Panel>
          <Panel icon={<Save />} title="Manage Room">
            <div className="space-y-2">
              {rooms.map((room) => <Row key={room.id} left={room.name} sub={room.division} right={room.type} />)}
            </div>
          </Panel>
          <Panel icon={<Megaphone />} title="Announcement">
            <input className="mb-3 w-full rounded-2xl border border-blue-100 bg-white/75 px-4 py-3 outline-none" placeholder="Judul" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} />
            <textarea className="mb-3 min-h-28 w-full rounded-2xl border border-blue-100 bg-white/75 px-4 py-3 outline-none" placeholder="Pesan pengumuman" value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} />
            <button onClick={sendAnnouncement} className="rounded-2xl bg-elGreen px-5 py-3 font-black text-white">Kirim Pengumuman</button>
            {announcementStatus && <p className="mt-3 text-sm font-bold text-elBlueDark">{announcementStatus}</p>}
            <div className="mt-5 space-y-2">
              {latestAnnouncements.map((item) => (
                <div key={item.id} className="rounded-2xl bg-soft px-4 py-3">
                  <p className="font-black text-elBlueDark">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return <div className="rounded-3xl bg-white/70 p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-elBlueDark">{value}</p></div>;
}

function Panel({ icon, title, children }) {
  return <section className="rounded-3xl bg-white/65 p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-black text-elBlueDark">{icon}{title}</h2>{children}</section>;
}

function Row({ left, sub, right }) {
  return <div className="flex items-center justify-between rounded-2xl bg-soft px-4 py-3"><div><p className="font-bold">{left}</p>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-elBlue">{right}</span></div>;
}
