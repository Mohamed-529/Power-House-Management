import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Navigation, Wrench,
  Fuel, BarChart2, Settings, Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fleet', icon: Truck, label: 'Fleet' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/trips', icon: Navigation, label: 'Trips' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/fuel', icon: Fuel, label: 'Fuel & Expenses' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// RBAC nav visibility — aligned with target users spec
const roleNav: Record<Role, string[]> = {
  'Fleet Manager':    ['/dashboard', '/fleet', '/maintenance', '/analytics', '/settings'],
  'Dispatcher':       ['/dashboard', '/fleet', '/drivers', '/trips'],
  'Safety Officer':   ['/dashboard', '/drivers', '/maintenance'],
  'Financial Analyst':['/dashboard', '/fuel', '/analytics'],
};

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const allowed = roleNav[role];

  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center shrink-0">
          <Zap size={16} className="text-black" />
        </div>
        <span className="font-bold text-white text-sm tracking-tight">FleetOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {allNavItems
          .filter((item) => allowed.includes(item.to))
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-warning text-black'
                    : 'text-gray-400 hover:text-white hover:bg-card'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="px-5 py-3 text-xs text-gray-600 border-t border-border">
        FleetOps © 2026 · RBAC ERP
      </div>
    </aside>
  );
}
