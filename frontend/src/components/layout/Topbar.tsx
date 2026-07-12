import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

export function Topbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const vehicles = useAppStore((s) => s.vehicles);
  const drivers = useAppStore((s) => s.drivers);
  const trips = useAppStore((s) => s.trips);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...vehicles
      .filter((v) => v.regNo.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
      .map((v) => ({ label: `${v.name} (${v.regNo})`, sub: `Vehicle · ${v.status}`, path: '/fleet' })),
    ...drivers
      .filter((d) => d.name.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q))
      .map((d) => ({ label: d.name, sub: `Driver · ${d.status}`, path: '/drivers' })),
    ...trips
      .filter((t) => t.id.toLowerCase().includes(q) || t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q))
      .map((t) => ({ label: `${t.id}: ${t.source} → ${t.destination}`, sub: `Trip · ${t.status}`, path: '/trips' })),
  ].slice(0, 8);

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'FL';

  return (
    <header className="h-14 bg-sidebar border-b border-border flex items-center px-5 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm relative" ref={ref}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search vehicles, drivers, trips..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="input pl-8 py-1.5 text-xs bg-bg/60 w-full"
        />
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-sidebar border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 hover:bg-card transition-colors flex items-start gap-3"
                onClick={() => { navigate(r.path); setQuery(''); setOpen(false); }}
              >
                <div>
                  <p className="text-xs text-white font-medium">{r.label}</p>
                  <p className="text-xs text-gray-500">{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {open && q.length >= 2 && results.length === 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-sidebar border border-border rounded-lg shadow-xl z-50 px-3 py-2">
            <p className="text-xs text-gray-500">No results for "{query}"</p>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white relative transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full" />
        </button>

        <span className="text-sm text-gray-300 hidden md:block">{user?.name}</span>

        {/* Role badge */}
        <div className="flex items-center gap-1.5 bg-primary/20 border border-primary/30 rounded-full px-3 py-1">
          <span className="text-xs text-blue-300 font-medium">{user?.role.split(' ')[0]}</span>
          <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 text-gray-400 hover:text-danger transition-colors text-xs"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
