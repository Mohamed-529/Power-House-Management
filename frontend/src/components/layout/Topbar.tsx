import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export function Topbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'FL';

  return (
    <header className="h-14 bg-sidebar border-b border-border flex items-center px-5 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="input pl-8 py-1.5 text-xs bg-bg/60"
        />
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
