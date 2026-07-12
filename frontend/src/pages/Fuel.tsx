import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatNumber, generateId } from '../utils/format';

const fuelSchema = z.object({
  vehicleId: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  liters: z.preprocess((v) => Number(v), z.number().positive('Must be positive')),
  costPerLiter: z.preprocess((v) => Number(v), z.number().positive('Must be positive')),
});

const expenseSchema = z.object({
  tripId: z.string().min(1, 'Required'),
  toll: z.preprocess((v) => Number(v), z.number().min(0, 'Cannot be negative')),
  other: z.preprocess((v) => Number(v), z.number().min(0, 'Cannot be negative')),
});

type FuelFormData = z.infer<typeof fuelSchema>;
type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function Fuel() {
  const { vehicles, trips, fuelLogs, addFuelLog, expenses, addExpense, maintenance } = useAppStore();
  const [fuelModal, setFuelModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  const totalFuel = fuelLogs.reduce((s, f) => s + f.total, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.toll + e.other, 0);
  const totalOps = totalFuel + totalMaint + totalExpenses;

  const fuelForm = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema) as any,
    defaultValues: { date: new Date().toISOString().slice(0, 10), liters: 0, costPerLiter: 75 },
  });

  const expForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { toll: 0, other: 0 },
  });

  const onFuelSubmit = (data: FuelFormData) => {
    const veh = vehicles.find((v) => v.id === data.vehicleId);
    addFuelLog({
      id: generateId(),
      vehicleId: data.vehicleId,
      vehicleName: veh?.name ?? '',
      date: data.date,
      liters: data.liters,
      costPerLiter: data.costPerLiter,
      total: data.liters * data.costPerLiter,
    });
    setFuelModal(false);
    fuelForm.reset({ date: new Date().toISOString().slice(0, 10), liters: 0, costPerLiter: 75 });
  };

  const onExpenseSubmit = (data: ExpenseFormData) => {
    const trip = trips.find((t) => t.id === data.tripId);
    const maintCost = maintenance.filter((m) => m.vehicleName === trip?.vehicleName).reduce((s, m) => s + m.cost, 0);
    addExpense({
      id: generateId(),
      tripId: data.tripId,
      vehicleName: trip?.vehicleName ?? '',
      toll: data.toll,
      other: data.other,
      maintenanceCost: maintCost,
      total: data.toll + data.other + maintCost,
      status: trip?.status ?? 'Draft',
    });
    setExpenseModal(false);
    expForm.reset({ toll: 0, other: 0 });
  };

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex justify-end gap-2">
        <button onClick={() => setFuelModal(true)} className="btn-warning flex items-center gap-1.5 text-xs py-1.5">
          <Plus size={14} /> Log Fuel
        </button>
        <button onClick={() => setExpenseModal(true)} className="btn-warning flex items-center gap-1.5 text-xs py-1.5">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {/* Fuel Logs */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Fuel Logs</h2>
        {fuelLogs.length === 0 ? (
          <EmptyState message="No fuel logs" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-left pb-2 font-medium">Liters</th>
                <th className="text-left pb-2 font-medium">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((f) => (
                <tr key={f.id} className="border-b border-border/40 table-row-hover">
                  <td className="py-2.5 text-white font-medium">{f.vehicleName}</td>
                  <td className="py-2.5 text-gray-400">{new Date(f.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-2.5 text-gray-400">{f.liters} L</td>
                  <td className="py-2.5 text-gray-300">{formatNumber(f.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expenses */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Other Expenses (Toll / Misc)</h2>
        {expenses.length === 0 ? (
          <EmptyState message="No expense records" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Trip</th>
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Toll</th>
                <th className="text-left pb-2 font-medium">Other</th>
                <th className="text-left pb-2 font-medium">Maint. (Linked)</th>
                <th className="text-left pb-2 font-medium">Total</th>
                <th className="text-left pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border/40 table-row-hover">
                  <td className="py-2.5 text-gray-300 font-mono text-xs">{e.tripId}</td>
                  <td className="py-2.5 text-white font-medium">{e.vehicleName}</td>
                  <td className="py-2.5 text-gray-400">{formatNumber(e.toll)}</td>
                  <td className="py-2.5 text-gray-400">{formatNumber(e.other)}</td>
                  <td className="py-2.5 text-gray-400">{e.maintenanceCost > 0 ? formatNumber(e.maintenanceCost) : '0'}</td>
                  <td className="py-2.5 text-gray-300 font-medium">{formatNumber(e.total)}</td>
                  <td className="py-2.5"><Badge label={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Total Operational Cost (Auto) = Fuel + Maint
          </span>
          <span className="text-warning font-bold text-lg">{formatNumber(totalOps)}</span>
        </div>
      </div>

      {/* Fuel Modal */}
      <Modal open={fuelModal} onClose={() => setFuelModal(false)} title="Log Fuel" size="sm">
        <form onSubmit={fuelForm.handleSubmit(onFuelSubmit)} className="space-y-3">
          <div>
            <label className="label">Vehicle</label>
            <select {...fuelForm.register('vehicleId')} className="input bg-bg">
              <option value="">Select...</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input {...fuelForm.register('date')} type="date" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Liters</label>
              <input {...fuelForm.register('liters')} type="number" min={0.1} step={0.1} className="input"
                onKeyDown={(e) => { if (/[^0-9.]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            </div>
            <div>
              <label className="label">Cost/Liter (₹)</label>
              <input {...fuelForm.register('costPerLiter')} type="number" min={1} className="input"
                onKeyDown={(e) => { if (/[^0-9.]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFuelModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-warning">Save</button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense" size="sm">
        <form onSubmit={expForm.handleSubmit(onExpenseSubmit)} className="space-y-3">
          <div>
            <label className="label">Trip</label>
            <select {...expForm.register('tripId')} className="input bg-bg">
              <option value="">Select...</option>
              {trips.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.source} → {t.destination}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Toll (₹)</label>
              <input {...expForm.register('toll')} type="number" min={0} className="input"
                onKeyDown={(e) => { if (/[^0-9]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            </div>
            <div>
              <label className="label">Other (₹)</label>
              <input {...expForm.register('other')} type="number" min={0} className="input"
                onKeyDown={(e) => { if (/[^0-9]/.test(e.key) && e.key.length === 1) e.preventDefault(); }} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setExpenseModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-warning">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
