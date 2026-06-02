import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Bell, Image, LogOut, Menu, Mic, Paperclip, Search, Send, Settings, Smile, UserRound, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, api, mediaUrl } from '../api/client.js';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [directUsers, setDirectUsers] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/chat/rooms').then(({ data }) => {
      setRooms(data);
      setActiveRoom(data[0] || null);
    });
    api.get('/chat/users').then(({ data }) => setDirectUsers(data));
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    api.get(`/chat/rooms/${activeRoom.id}/messages`).then(({ data }) => setMessages(data));
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { username: user?.username || '' },
      onConnect: () => client.subscribe(`/topic/rooms/${activeRoom.id}`, (frame) => setMessages((prev) => [...prev, JSON.parse(frame.body)])),
    });
    client.activate();
    return () => client.deactivate();
  }, [activeRoom?.id]);

  async function send() {
    if (!text.trim() || !activeRoom) return;
    await api.post('/chat/messages', { roomId: activeRoom.id, content: text, type: 'TEXT' });
    setText('');
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file || !activeRoom) return;
    const form = new FormData();
    form.append('image', file);
    await api.post(`/chat/rooms/${activeRoom.id}/images`, form);
    event.target.value = '';
  }

  async function openDirect(target) {
    const { data } = await api.post(`/chat/direct/${target.id}`);
    setRooms((prev) => [data, ...prev]);
    setActiveRoom(data);
    setMobileNav(false);
  }

  return (
    <main className="app-shell">
      <div className="glass mx-auto grid h-[calc(100vh-36px)] max-w-[1440px] grid-cols-1 overflow-hidden rounded-[32px] lg:grid-cols-[280px_1fr_290px]">
        <aside className={`${mobileNav ? 'block' : 'hidden'} border-r border-blue-100/80 p-5 lg:block`}>
          <Logo />
          <nav className="mt-8 space-y-3">
            {rooms.map((room) => (
              <button key={room.id} onClick={() => { setActiveRoom(room); setMobileNav(false); }} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold ${activeRoom?.id === room.id ? 'bg-elBlue text-white shadow-soft' : 'bg-white/55 text-elBlueDark'}`}>
                <span># {room.name}</span>
                <span className="text-xs">{room.type}</span>
              </button>
            ))}
          </nav>
          <div className="mt-8">
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Direct Messages</p>
            <div className="space-y-3">
              {directUsers.filter((item) => item.id !== user?.id).map((item, index) => (
                <button key={item.id} onClick={() => openDirect(item)} className="flex w-full items-center gap-3 rounded-2xl bg-white/50 p-2 text-left">
                  <Avatar name={item.fullName} index={index} src={item.avatarUrl} />
                  <div>
                    <p className="text-sm font-bold">{item.fullName}</p>
                    <p className={`text-xs ${item.online ? 'text-elGreen' : 'text-slate-400'}`}>{item.online ? 'Online' : 'Offline'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col border-r border-blue-100/80">
          <header className="flex items-center justify-between border-b border-blue-100/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl bg-white/70 p-2 lg:hidden" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button>
              <div>
                <h2 className="text-2xl font-black text-elBlueDark"># {activeRoom?.name || 'General'}</h2>
                <p className="text-sm font-semibold text-elGreen">35 online</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 rounded-2xl bg-white/65 px-4 py-3 md:flex">
              <Search size={18} className="text-elBlue" />
              <input className="bg-transparent text-sm outline-none" placeholder="Search messages..." />
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.sender?.id === user?.id} />)}
            {!messages.length && (
              <div className="mx-auto mt-16 max-w-sm text-center">
                <img src="/favicon.png" alt="" className="mx-auto h-24 w-24 rounded-3xl" />
                <p className="mt-4 text-lg font-black text-elBlueDark">Mulai percakapan kantor</p>
                <p className="mt-1 text-sm text-slate-500">Pesan realtime akan muncul di room ini dan otomatis dibersihkan setelah 3 hari.</p>
              </div>
            )}
          </div>

          <footer className="relative px-5 pb-5">
            {showEmoji && <div className="absolute bottom-24 right-5 z-10"><Picker data={data} onEmojiSelect={(emoji) => setText((prev) => prev + emoji.native)} /></div>}
            <div className="flex items-center gap-2 rounded-3xl border border-blue-100 bg-white/85 p-3 shadow-soft">
              <button className="rounded-2xl p-2 text-elBlue" title="Emoji" onClick={() => setShowEmoji(!showEmoji)}><Smile size={21} /></button>
              <button className="rounded-2xl p-2 text-elBlue" title="Attach"><Paperclip size={21} /></button>
              <button className="rounded-2xl p-2 text-elBlue" title="Upload gambar" onClick={() => fileRef.current?.click()}><Image size={21} /></button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
              <input className="min-w-0 flex-1 bg-transparent px-2 outline-none" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
              <button className="rounded-2xl bg-elBlue p-3 text-white shadow-soft" onClick={send} title="Send"><Send size={20} /></button>
            </div>
          </footer>
        </section>

        <aside className="hidden p-5 xl:block">
          <div className="mb-5 flex items-center justify-between">
            <Bell className="text-elBlue" />
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName || 'User'} index={1} src={user?.avatarUrl} />
              <div>
                <p className="font-black">{user?.fullName}</p>
                <p className="text-xs text-elGreen">Online</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-elBlue to-violet-600 text-white shadow-soft">
            <div className="p-6 text-center">
              <Avatar large name={user?.fullName || 'User'} src={user?.avatarUrl} />
              <h3 className="mt-3 text-3xl font-black">{user?.fullName}</h3>
              <p className="mt-1 rounded-full bg-white/25 px-3 py-1 text-sm">{user?.division || 'Internal'}</p>
            </div>
            <div className="space-y-2 bg-white p-4 text-elBlueDark">
              <Link className="flex items-center gap-3 rounded-2xl p-3 hover:bg-soft" to="/profile"><UserRound size={18} /> Edit Profile</Link>
              <Link className="flex items-center gap-3 rounded-2xl p-3 hover:bg-soft" to="/admin"><Settings size={18} /> Admin Panel</Link>
              <button className="flex w-full items-center gap-3 rounded-2xl p-3 text-red-500 hover:bg-red-50" onClick={logout}><LogOut size={18} /> Logout</button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="rounded-2xl bg-white/75 p-4 font-bold text-elBlue shadow-soft" title="Voice call V2"><Mic className="mx-auto mb-2" />Voice</button>
            <button className="rounded-2xl bg-white/75 p-4 font-bold text-elBlue shadow-soft" title="Video call V2"><Video className="mx-auto mb-2" />Video</button>
          </div>
          {/* TODO: Implementasi WebRTC pada versi berikutnya. */}
        </aside>
      </div>
    </main>
  );
}

function MessageBubble({ message, mine }) {
  return (
    <div className={`flex items-end gap-3 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && <Avatar name={message.sender?.fullName} src={message.sender?.avatarUrl} />}
      <div className={`max-w-[76%] rounded-3xl px-4 py-3 shadow-sm ${mine ? 'bubble-mine rounded-br-md' : 'bubble-other rounded-bl-md'}`}>
        <div className="mb-1 flex items-center gap-3 text-xs font-bold opacity-80">
          <span>{message.sender?.fullName}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {message.type === 'IMAGE' ? <img src={mediaUrl(message.fileUrl)} alt={message.originalFileName || 'Chat image'} className="max-h-72 rounded-2xl object-cover" /> : <p className="whitespace-pre-wrap">{message.content}</p>}
      </div>
    </div>
  );
}

function Avatar({ name = 'User', index = 0, large = false, src }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  if (src) return <img src={mediaUrl(src)} alt={name} className={`${large ? 'h-28 w-28 border-4' : 'h-10 w-10'} mx-auto rounded-full border-white object-cover`} />;
  const colors = ['from-sky-400 to-elBlue', 'from-violet-400 to-elBlue', 'from-elGreen to-sky-500'];
  return <div className={`${large ? 'h-28 w-28 text-3xl' : 'h-10 w-10 text-sm'} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[index % colors.length]} font-black text-white`}>{initials}</div>;
}
