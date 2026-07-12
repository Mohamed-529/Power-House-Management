import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { isLicenseExpired, generateId } from '../utils/format';
import type { Driver, DriverStatus } from '../types';

const schema = z.object({
  name: z.string()
    .min(1, 'Required')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain letters only'),
  licenseNo: z.string()
    .min(1, 'Required')
    .regex(/^[a-zA-Z0-9-]+$/, 'License No. must be alphanumeric (letters, numbers, hyphens only)'),
  licenseCategory: z.enum(['LMV', 'HMV']),
  licenseExpiry: z.string().min(1, 'Required'),
  contact: z.string()
    .regex(/^[0-9]{10}$/, 'Contact must be exactly 10 digits'),
  tripCompleted: z.preprocess((v) => Number(v), z.number().min(0).max(9999)),
  safetyScore: z.preprocess((v) => Number(v), z.number().min(0).max(100)),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
});

type FormData = z.infer<typeof schema>;

const statuses: DriverStatus[] = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { status: 'Available', licenseCategory: 'LMV', tripCompleted: 0, safetyScore: 100 },
  });

  const openAdd = () => { setEditing(null); reset({ status: 'Available', licenseCategory: 'LMV', tripCompleted: 0, safetyScore: 100, name: '', licenseNo: '', licenseExpiry: '', contact: '' }); setModalOpen(true); };
  const openEdit = (d: Driver) => { setEditing(d); reset(d); setModalOpen(true); };

  const onSubmit = (data: FormData) => {
    if (editing) updateDriver({ ...editing, ...data });
    else addDriver({ id: generateId(), ...data });
    setModalOpen(false);
  };

  const filtered = drivers.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q);
  });

  const isBlocked = (d: Driver) => isLicenseExpired(d.licenseExpiry) || d.status === 'Suspended';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-8 py-1.5 text-xs w-44" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-xs py-1.5">
            <option value="All">Status: All</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-warning flex items-center gap-1.5 text-xs py-1.5">
          <Plus size={14} /> Add Driver
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Driver</th>
              <th className="text-left px-4 py-3 font-medium">License No.</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Expiry</th>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium">Trip Compl.</th>
              <th className="text-left px-4 py-3 font-medium">Safety</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState /></td></tr>
            ) : (
              filtered.map((d) => {
                const expired = isLicenseExpired(d.licenseExpiry);
                return (
                  <tr key={d.id} className="border-b border-border/40 table-row-hover">
                    <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                      {d.name}
                      {isBlocked(d) && <AlertTriangle size={13} className="text-danger" />}
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{d.licenseNo}</td>
                    <td className="px-4 py-3 text-gray-400">{d.licenseCategory}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${expired ? 'text-danger' : 'text-gray-400'}`}>
                      {d.licenseExpiry.slice(0, 7).replace('-', '/')}
                      {expired && <span className="ml-1 text-danger">EXPIRED</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{d.contact}</td>
                    <td className="px-4 py-3 text-gray-400">{d.tripCompleted}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-bg rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${d.safetyScore}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{d.safetyScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge label={d.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(d)} className="text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => deleteDriver(d.id)} className="text-gray-400 hover:text-danger transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-border/40">
          <p className="text-xs text-warning">Rule: Expired license or Suspended status — blocked from trip assignment</p>
        </div>
      </div>

      {/* Status toggle legend */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 mr-1">Toggle Stat:</span>
        {statuses.map((s) => <Badge key={s} label={s} />)}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input" placeholder="e.g. Ramesh Singh"
              onKeyDown={(e) => { if (/[^a-zA-Z\s]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">License No.</label>
            <input {...register('licenseNo')} className="input" placeholder="e.g. DL-88213"
              onKeyDown={(e) => { if (/[^a-zA-Z0-9-]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            {errors.licenseNo && <p className="text-xs text-danger mt-1">{errors.licenseNo.message}</p>}
          </div>
          <div>
            <label className="label">License Category</label>
            <select {...register('licenseCategory')} className="input bg-bg">
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
            </select>
          </div>
          <div>
            <label className="label">License Expiry</label>
            <input {...register('licenseExpiry')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Contact</label>
            <input {...register('contact')} className="input" placeholder="10 digit number"
              maxLength={10}
              onKeyDown={(e) => { if (/[^0-9]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            {errors.contact && <p className="text-xs text-danger mt-1">{errors.contact.message}</p>}
          </div>
          <div>
            <label className="label">Trips Completed</label>
            <input {...register('tripCompleted')} type="number" min={0} max={9999} className="input" />
          </div>
          <div>
            <label className="label">Safety Score (0-100)</label>
            <input {...register('safetyScore')} type="number" min={0} max={100} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input bg-bg">
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-warning">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
