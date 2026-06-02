import Logo from './Logo.jsx';

export default function AuthShell({ children, title }) {
  return (
    <main className="grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden flex-col justify-center px-16 lg:flex">
        <div className="max-w-lg">
          <img src="/favicon.png" alt="Elshinta Chat Internal" className="mb-7 h-44 w-44 rounded-[42px] object-cover shadow-soft" />
          <h2 className="text-6xl font-black tracking-normal text-elBlueDark">Elshinta</h2>
          <p className="mt-1 text-4xl font-bold text-elBlue">Chat Internal</p>
          <p className="mt-7 text-xl font-medium text-slate-700">Stay Connected. Inside the Office.</p>
          <div className="mt-11 grid grid-cols-3 gap-4">
            {['Realtime', 'Private', 'LAN Ready'].map((item) => (
              <div key={item} className="glass rounded-3xl p-5 text-center font-bold text-elBlueDark">{item}</div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="glass w-full max-w-md rounded-[34px] p-8">
          <Logo />
          <h2 className="mt-8 text-3xl font-black text-elBlueDark">{title}</h2>
          <p className="mb-7 mt-2 text-sm font-medium text-slate-500">Stay Connected. Inside the Office.</p>
          {children}
        </div>
      </section>
    </main>
  );
}

