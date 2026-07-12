import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Badge } from '../components/ui/Badge';
import { isLicenseExpired } from '../utils/format';
import type { TripStatus } from '../types';

const schema = z.object({
  source: z.string().min(1, 'Required'),
  destination: z.string().min(1, 'Required'),
  vehicleId: z.string().min(1, 'Select a vehicle'),
  driverId: z.string().min(1, 'Select a driver'),
  cargoWeight: z.preprocess((v) => Number(v), z.number().positive('Must be positive')),
  plannedDistance: z.preprocess((v) => Number(v), z.number().positive('Must be positive')),
});

type FormData = z.infer<typeof schema>;

const lifecycle: TripStatus[] = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function Trips() {
  const { vehicles, drivers, trips, addTrip, updateTrip } = useAppStore();
  const [dispatchError, setDispatchError] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'Available' && !isLicenseExpired(d.licenseExpiry));

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { cargoWeight: 0, plannedDistance: 0 },
  });

  const watchVehicleId = watch('vehicleId');
  const watchCargo = watch('cargoWeight');
  const selectedVehicle = vehicles.find((v) => v.id === watchVehicleId);

  const capacityExceeded = selectedVehicle && watchCargo > selectedVehicle.capacityKg;

  const onDispatch = async (data: FormData) => {
    const errs: string[] = [];
    const veh = vehicles.find((v) => v.id === data.vehicleId);
    const drv = drivers.find((d) => d.id === data.driverId);

    if (!veh || veh.status !== 'Available') errs.push('Vehicle is not available');
    if (!drv || drv.status !== 'Available') errs.push('Driver is not available');
    if (drv && isLicenseExpired(drv.licenseExpiry)) errs.push('Driver license is expired');
    if (veh && data.cargoWeight > veh.capacityKg) errs.push(`Capacity exceeded by ${data.cargoWeight - veh.capacityKg} kg — dispatch blocked`);

    setDispatchError(errs);
    if (errs.length > 0) return;

    try {
      await addTrip({
        source: data.source,
        destination: data.destination,
        vehicleId: data.vehicleId,
        vehicleName: veh!.name,
        driverId: data.driverId,
        driverName: drv!.name,
        cargoWeight: data.cargoWeight,
        plannedDistance: data.plannedDistance,
      });
      setSuccess('Trip dispatched successfully!');
      setTimeout(() => setSuccess(''), 3000);
      reset({ cargoWeight: 0, plannedDistance: 0, source: '', destination: '', vehicleId: '', driverId: '' });
      setDispatchError([]);
    } catch (e: any) {
      setDispatchError([e.message || 'Failed to dispatch trip. Please try again.']);
    }
  };

  const updateStatus = async (id: string, status: TripStatus) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;
    try {
      await updateTrip({ ...trip, status });
    } catch (e: any) {
      setDispatchError([e.message || `Failed to update trip to ${status}`]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left: Trip creation */}
      <div className="space-y-4">
        {/* Lifecycle stepper */}
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Trip Lifecycle</p>
          <div className="flex items-center gap-0">
            {lifecycle.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? 'border-success bg-success' : i === 1 ? 'border-primary bg-primary' : 'border-border bg-bg'}`} />
                  <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{step}</span>
                </div>
                {i < lifecycle.length - 1 && <div className="flex-1 h-px bg-border mx-1 mb-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Create Trip</h2>

          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-3 py-2 mb-3 text-sm text-success">
              <Check size={14} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onDispatch)} className="space-y-3">
            <div>
              <label className="label">Source</label>
              <input {...register('source')} className="input" placeholder="Gandhinagar Depot" />
              {errors.source && <p className="text-xs text-danger mt-1">{errors.source.message}</p>}
            </div>
            <div>
              <label className="label">Destination</label>
              <input {...register('destination')} className="input" placeholder="Ahmedabad Hub" />
              {errors.destination && <p className="text-xs text-danger mt-1">{errors.destination.message}</p>}
            </div>
            <div>
              <label className="label">Vehicle (Available only)</label>
              <select {...register('vehicleId')} className="input bg-bg">
                <option value="">Select vehicle...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} — {v.capacity}</option>
                ))}
              </select>
              {errors.vehicleId && <p className="text-xs text-danger mt-1">{errors.vehicleId.message}</p>}
            </div>
            <div>
              <label className="label">Driver (Available only)</label>
              <select {...register('driverId')} className="input bg-bg">
                <option value="">Select driver...</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.driverId && <p className="text-xs text-danger mt-1">{errors.driverId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cargo Weight (kg)</label>
                <input {...register('cargoWeight')} type="number" className="input" />
                {errors.cargoWeight && <p className="text-xs text-danger mt-1">{errors.cargoWeight.message}</p>}
              </div>
              <div>
                <label className="label">Planned Distance (km)</label>
                <input {...register('plannedDistance')} type="number" className="input" />
              </div>
            </div>

            {/* Validation errors */}
            {(dispatchError.length > 0 || capacityExceeded) && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2.5">
                {selectedVehicle && (
                  <p className="text-xs text-gray-400 mb-1">Vehicle Capacity: {selectedVehicle.capacityKg} kg</p>
                )}
                {watchCargo > 0 && <p className="text-xs text-gray-400 mb-1">Cargo Weight: {watchCargo} kg</p>}
                {dispatchError.map((e, i) => (
                  <p key={i} className="text-xs text-danger flex items-center gap-1"><AlertCircle size={11} /> {e}</p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!!capacityExceeded}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${capacityExceeded ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-warning'}`}
              >
                {capacityExceeded ? 'Dispatch (Disabled)' : 'Dispatch Trip'}
              </button>
              <button type="button" onClick={() => { reset(); setDispatchError([]); }} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Live Dispatch Board */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Live Board</h2>
        <div className="space-y-3">
          {trips.map((t) => (
            <div key={t.id} className="border border-border rounded-lg p-3 hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">{t.id}</span>
                    <span className="text-xs text-gray-400">{t.vehicleName || 'Unassigned'} / {t.driverName || 'Unassigned'}</span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{t.source} → {t.destination}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge label={t.status} />
                    <span className="text-xs text-gray-500">{t.eta || ''}</span>
                  </div>
                </div>
                {/* Status update controls */}
                {t.status === 'Dispatched' && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => updateStatus(t.id, 'Completed')} className="text-xs bg-success/20 text-success px-2 py-0.5 rounded hover:bg-success/30 transition-colors">Complete</button>
                    <button onClick={() => updateStatus(t.id, 'Cancelled')} className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded hover:bg-danger/30 transition-colors">Cancel</button>
                  </div>
                )}
                {t.status === 'Draft' && (
                  <button onClick={() => updateStatus(t.id, 'Dispatched')} className="text-xs bg-primary/20 text-blue-400 px-2 py-0.5 rounded hover:bg-primary/30 transition-colors shrink-0">Dispatch</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 border-t border-border pt-3">
          On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
        </p>
      </div>
    </div>
  );
}
