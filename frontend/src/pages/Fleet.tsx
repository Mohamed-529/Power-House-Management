import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatNumber, generateId } from '../utils/format';
import type { Vehicle } from '../types';

const schema = z.object({
  regNo: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  type: z.enum(['Van', 'Truck', 'Mini', 'Bus']),
  capacity: z.string().min(1, 'Required'),
  capacityKg: z.preprocess((v) => Number(v), z.number().positive()),
  odometer: z.preprocess((v) => Number(v), z.number().min(0)),
  acquisitionCost: z.preprocess((v) => Number(v), z.number().positive()),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

type SortKey = keyof Vehicle;

export default function Fleet() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('regNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const perPage = 8;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'Van', status: 'Available', region: 'North', odometer: 0, acquisitionCost: 0, capacityKg: 0 },
  });

  const openAdd = () => { setEditing(null); reset({ type: 'Van', status: 'Available', region: 'North', odometer: 0, acquisitionCost: 0, capacityKg: 0, regNo: '', name: '', capacity: '' }); setModalOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); reset(v); setModalOpen(true); };

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateVehicle({ ...editing, ...data });
    } else {
      const regNos = vehicles.map((v) => v.regNo);
      if (regNos.includes(data.regNo)) { alert('Registration No. must be unique'); return; }
      addVehicle({ id: generateId(), ...data });
    }
    setModalOpen(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = vehicles
    .filter((v) => {
      if (typeFilter !== 'All' && v.type !== typeFilter) return false;
      if (statusFilter !== 'All' && v.status !== statusFilter) return false;
      const q = search.toLowerCase();
      return v.regNo.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto text-xs py-1.5">
            <option value="All">Type: All</option>
            {['Van', 'Truck', 'Mini', 'Bus'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-xs py-1.5">
            <option value="All">Status: All</option>
            {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reg. no..." className="input pl-8 py-1.5 text-xs w-44" />
          </div>
        </div>
        <button onClick={openAdd} className="btn-warning flex items-center gap-1.5 text-xs py-1.5">
          <Plus size={14} /> Add Vehicle
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              {([['regNo', 'Reg. No (Unique)'], ['name', 'Name/Mode'], ['type', 'Type'], ['capacity', 'Capacity'], ['odometer', 'Odometer'], ['acquisitionCost', 'Acq. Cost'], ['status', 'Status']] as [SortKey, string][]).map(([k, label]) => (
                <th key={k} className="text-left px-4 py-3 font-medium cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort(k)}>
                  <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8}><EmptyState /></td></tr>
            ) : (
              paginated.map((v) => (
                <tr key={v.id} className="border-b border-border/40 table-row-hover">
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">{v.regNo}</td>
                  <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-gray-400">{v.type}</td>
                  <td className="px-4 py-3 text-gray-400">{v.capacity}</td>
                  <td className="px-4 py-3 text-gray-400">{formatNumber(v.odometer)}</td>
                  <td className="px-4 py-3 text-gray-400">{formatNumber(v.acquisitionCost)}</td>
                  <td className="px-4 py-3"><Badge label={v.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteVehicle(v.id)} className="text-gray-400 hover:text-danger transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Rule note */}
        <div className="px-4 py-2 border-t border-border/40">
          <p className="text-xs text-warning">Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher</p>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end text-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">Prev</button>
          <span className="text-gray-400 text-xs">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Reg. No.</label>
            <input {...register('regNo')} className="input" disabled={!!editing} />
            {errors.regNo && <p className="text-xs text-danger mt-1">{errors.regNo.message}</p>}
          </div>
          <div>
            <label className="label">Name/Mode</label>
            <input {...register('name')} className="input" />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Type</label>
            <select {...register('type')} className="input bg-bg">
              {['Van', 'Truck', 'Mini', 'Bus'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Capacity (label)</label>
            <input {...register('capacity')} className="input" placeholder="500 kg" />
          </div>
          <div>
            <label className="label">Capacity (kg)</label>
            <input {...register('capacityKg')} type="number" className="input" />
          </div>
          <div>
            <label className="label">Odometer (km)</label>
            <input {...register('odometer')} type="number" className="input" />
          </div>
          <div>
            <label className="label">Acq. Cost (₹)</label>
            <input {...register('acquisitionCost')} type="number" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input bg-bg">
              {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Region</label>
            <select {...register('region')} className="input bg-bg">
              {['North', 'South', 'East', 'West'].map((r) => <option key={r} value={r}>{r}</option>)}
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
