import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../../store/appStore';
import type { Role } from '../../types';

// Must stay in sync with Sidebar roleNav
const roleNav: Record<Role, string[]> = {
  'Fleet Manager':    ['/dashboard', '/fleet', '/maintenance', '/analytics', '/settings'],
  'Dispatcher':       ['/dashboard', '/fleet', '/drivers', '/trips'],
  'Safety Officer':   ['/dashboard', '/drivers', '/maintenance'],
  'Financial Analyst':['/dashboard', '/fuel', '/analytics'],
};

export function AppLayout() {
  const user = useAppStore((s) => s.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const allowed = roleNav[user.role];
  const currentBase = '/' + location.pathname.split('/')[1];

  // If user tries to access a route outside their role, redirect to their first allowed page
  if (currentBase !== '/' && !allowed.includes(currentBase)) {
    return <Navigate to={allowed[0]} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
