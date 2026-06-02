import React from 'react';
import Logo from './Logo.jsx';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="glass max-w-md rounded-[32px] p-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-2xl font-black text-elBlueDark">Aplikasi perlu dimuat ulang</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Session browser lama sudah dibersihkan. Klik tombol di bawah untuk membuka login kembali.</p>
          <button
            className="mt-6 rounded-2xl bg-elBlue px-5 py-3 font-black text-white shadow-soft"
            onClick={() => {
              localStorage.removeItem('elshinta_token');
              localStorage.removeItem('elshinta_user');
              window.location.href = '/login';
            }}
          >
            Buka Login
          </button>
        </section>
      </main>
    );
  }
}
