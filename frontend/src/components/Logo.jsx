import logo from '../assets/elshinta-chat-byvins.png';

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img src={logo} alt="Elshinta Chat" className={compact ? 'h-11 w-11 rounded-2xl object-cover' : 'h-16 w-16 rounded-3xl object-cover'} />
      {!compact && (
        <div>
          <h1 className="text-xl font-black tracking-normal text-elBlueDark">Elshinta Chat</h1>
          <p className="text-sm font-medium text-elBlue">Internal</p>
        </div>
      )}
    </div>
  );
}

