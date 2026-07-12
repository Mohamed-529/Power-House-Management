import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatNumber, generateId } from '../utils/format';

const schema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  serviceType: z.string().min(1, 'Required'),
  cost: z.preprocess((v) => Number(v), z.number().positive()),
  date: z.string().min(1, 'Required'),
  status: z.enum(['Active', 'Completed']),
});

type FormData = z.infer<typeof schema>;

export default function Maintenance() {
  const { vehicles, maintenance, addMaintenance, updateMaintenance } = useAppStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      status: 'Active',
      date: new Date().toISOString().slice(0, 10),
      cost: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    const veh = vehicles.find((v) => v.id === data.vehicleId);
    addMaintenance({
      id: generateId(),
      vehicleId: data.vehicleId,
      vehicleName: veh?.name ?? '',
      serviceType: data.serviceType,
      cost: data.cost,
      date: data.date,
      status: data.status,
    });
    reset({ status: 'Active', date: new Date().toISOString().slice(0, 10), cost: 0, vehicleId: '', serviceType: '' });
  };

  const markComplete = (id: string) => {
    const rec = maintenance.find((m) => m.id === id);
    if (!rec) return;
    updateMaintenance({ ...rec, status: 'Completed' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Log Service Record</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Vehicle</label>
            <select {...register('vehicleId')} className="input bg-bg">
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-xs text-danger mt-1">{errors.vehicleId.message}</p>}
          </div>
          <div>
            <label className="label">Service Type</label>
            <input {...register('serviceType')} className="input" placeholder="Oil Change" />
            {errors.serviceType && <p className="text-xs text-danger mt-1">{errors.serviceType.message}</p>}
          </div>
          <div>
            <label className="label">Cost (₹)</label>
            <input {...register('cost')} type="number" className="input" placeholder="2500" />
            {errors.cost && <p className="text-xs text-danger mt-1">{errors.cost.message}</p>}
          </div>
          <div>
            <label className="label">Date</label>
            <input {...register('date')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input bg-bg">
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="btn-warning w-full py-2.5 font-semibold">Save</button>
        </form>

        {/* Workflow arrows */}
        <div className="mt-5 border-t border-border pt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-success">Available</span>
            <span className="text-gray-500">— create service record →</span>
            <span className="text-warning">In Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-warning">In Shop</span>
            <span className="text-gray-500">— mark as Completed →</span>
            <span className="text-success">Available</span>
          </div>
          <p className="text-danger">Note: In Shop vehicles are removed from the dispatch pool.</p>
        </div>
      </div>

      {/* Service Log */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Service Log</h2>
        {maintenance.length === 0 ? (
          <EmptyState message="No maintenance records" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Service</th>
                <th className="text-left pb-2 font-medium">Cost</th>
                <th className="text-left pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => (
                <tr key={m.id} className="border-b border-border/40 table-row-hover">
                  <td className="py-2.5 text-white font-medium">{m.vehicleName}</td>
                  <td className="py-2.5 text-gray-400">{m.serviceType}</td>
                  <td className="py-2.5 text-gray-400">₹{formatNumber(m.cost)}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge label={m.status} />
                      {m.status === 'Active' && (
                        <button
                          onClick={() => markComplete(m.id)}
                          className="text-xs text-success hover:underline"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
