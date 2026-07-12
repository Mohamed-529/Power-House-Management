import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import type { OrgSettings, RBACRow } from '../types';
import { Check } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  depotName: z.string().min(1, 'Required'),
  currency: z.string().min(1, 'Required'),
  distanceUnit: z.string().min(1, 'Required'),
});

const rbacData: RBACRow[] = [
  { role: 'Fleet Manager',    fleet: 'Full', drivers: '—',    trips: '—',    fuelExp: '—',    analytics: 'Full' },
  { role: 'Dispatcher',       fleet: 'View', drivers: 'Full', trips: 'Full', fuelExp: '—',    analytics: '—'    },
  { role: 'Safety Officer',   fleet: '—',    drivers: 'Full', trips: '—',    fuelExp: '—',    analytics: '—'    },
  { role: 'Financial Analyst',fleet: '—',    drivers: '—',    trips: '—',    fuelExp: 'Full', analytics: 'Full' },
];

const AccessCell = ({ access }: { access: string }) => {
  if (access === 'Full') return <span className="text-success flex items-center gap-1"><Check size={13} /> Full</span>;
  if (access === 'View') return <span className="text-blue-400 text-xs">View</span>;
  return <span className="text-gray-600">—</span>;
};

export default function Settings() {
  const { settings, updateSettings, user } = useAppStore();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<OrgSettings>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });

  const onSubmit = (data: OrgSettings) => {
    updateSettings(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* General Settings */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-5">General</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Depot Name</label>
            <input {...register('depotName')} className="input" placeholder="Gandhinagar Depot GJ14" />
            {errors.depotName && <p className="text-xs text-danger mt-1">{errors.depotName.message}</p>}
          </div>
          <div>
            <label className="label">Currency</label>
            <select {...register('currency')} className="input bg-bg">
              <option value="INR (₹)">INR (₹)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="label">Distance Unit</label>
            <select {...register('distanceUnit')} className="input bg-bg">
              <option value="Kilometers">Kilometers</option>
              <option value="Miles">Miles</option>
            </select>
          </div>

          <button type="submit" className="btn-primary text-sm px-5">
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
        </form>

        {/* Profile Info */}
        <div className="mt-6 pt-5 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Profile</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-300">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-300">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-300">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Table */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-5">Role-Based Access (RBAC)</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left pb-2 font-medium">Role</th>
              <th className="text-left pb-2 font-medium">Fleet</th>
              <th className="text-left pb-2 font-medium">Drivers</th>
              <th className="text-left pb-2 font-medium">Trips</th>
              <th className="text-left pb-2 font-medium">Fuel/Exp</th>
              <th className="text-left pb-2 font-medium">Analytics</th>
            </tr>
          </thead>
          <tbody>
            {rbacData.map((row) => (
              <tr
                key={row.role}
                className={`border-b border-border/40 ${user?.role === row.role ? 'bg-primary/5' : ''}`}
              >
                <td className="py-3 text-white font-medium text-xs">{row.role}</td>
                <td className="py-3 text-xs"><AccessCell access={row.fleet} /></td>
                <td className="py-3 text-xs"><AccessCell access={row.drivers} /></td>
                <td className="py-3 text-xs"><AccessCell access={row.trips} /></td>
                <td className="py-3 text-xs"><AccessCell access={row.fuelExp} /></td>
                <td className="py-3 text-xs"><AccessCell access={row.analytics} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Notifications</h3>
          <div className="space-y-3">
            {[
              'License expiry alerts',
              'Maintenance due reminders',
              'Trip completion notifications',
              'Over-capacity warnings',
            ].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-primary" />
                <span className="text-sm text-gray-400">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
