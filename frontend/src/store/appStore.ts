import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, ExpenseRecord, OrgSettings } from '../types';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;

  // Sync data from backend
  fetchInitialData: () => Promise<void>;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (v: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Drivers
  drivers: Driver[];
  addDriver: (d: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (d: Driver) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;

  // Trips
  trips: Trip[];
  addTrip: (t: Omit<Trip, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateTrip: (t: Trip, updates?: { endOdometer?: number; fuelConsumed?: number }) => Promise<void>;

  // Maintenance
  maintenance: MaintenanceRecord[];
  addMaintenance: (m: Omit<MaintenanceRecord, 'id' | 'date'>) => Promise<void>;
  updateMaintenance: (m: MaintenanceRecord) => Promise<void>;

  // Fuel & Expenses
  fuelLogs: FuelLog[];
  addFuelLog: (f: Omit<FuelLog, 'id' | 'date' | 'total'>) => Promise<void>;
  expenses: ExpenseRecord[];
  addExpense: (e: Omit<ExpenseRecord, 'id' | 'total' | 'status'>) => Promise<void>;

  // Settings
  settings: OrgSettings;
  updateSettings: (s: OrgSettings) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),

      vehicles: [],
      drivers: [],
      trips: [],
      maintenance: [],
      fuelLogs: [],
      expenses: [],
      settings: { depotName: 'Gandhinagar Depot GJ14', currency: 'INR (₹)', distanceUnit: 'Kilometers' },

      fetchInitialData: async () => {
        try {
          const [vehiclesRes, driversRes, tripsRes, maintenanceRes, fuelRes, expensesRes] = await Promise.all([
            fetch('/api/vehicles').then((r) => r.json()),
            fetch('/api/drivers').then((r) => r.json()),
            fetch('/api/trips').then((r) => r.json()),
            fetch('/api/maintenance').then((r) => r.json()),
            fetch('/api/fuel').then((r) => r.json()),
            fetch('/api/expenses').then((r) => r.json()),
          ]);

          const mappedVehicles = Array.isArray(vehiclesRes) ? vehiclesRes.map((v: any) => ({
            id: String(v.id),
            regNo: v.regNumber,
            name: v.model,
            type: v.type,
            capacity: `${v.maxCapacityKg} kg`,
            capacityKg: v.maxCapacityKg,
            odometer: v.odometer,
            acquisitionCost: v.acquisitionCost,
            status: v.status,
            region: 'North',
          })) : [];

          const mappedDrivers = Array.isArray(driversRes) ? driversRes.map((d: any) => ({
            id: String(d.id),
            name: d.name,
            licenseNo: d.licenseNumber,
            licenseCategory: d.category,
            licenseExpiry: new Date(d.expiryDate).toISOString().split('T')[0],
            contact: d.contactNumber,
            tripCompleted: 0,
            safetyScore: d.safetyScore,
            status: d.status,
          })) : [];

          const mappedTrips = Array.isArray(tripsRes) ? tripsRes.map((t: any) => ({
            id: String(t.id),
            source: t.source,
            destination: t.destination,
            vehicleId: String(t.vehicleId),
            vehicleName: t.vehicle?.model || `Vehicle #${t.vehicleId}`,
            driverId: String(t.driverId),
            driverName: t.driver?.name || `Driver #${t.driverId}`,
            cargoWeight: t.cargoWeightKg,
            plannedDistance: t.plannedDistance,
            status: t.status,
            createdAt: new Date(t.createdAt).toISOString(),
          })) : [];

          const mappedMaintenance = Array.isArray(maintenanceRes) ? maintenanceRes.map((m: any) => ({
            id: String(m.id),
            vehicleId: String(m.vehicleId),
            vehicleName: m.vehicle?.model || `Vehicle #${m.vehicleId}`,
            serviceType: m.description,
            cost: m.cost,
            date: new Date(m.startDate).toISOString().split('T')[0],
            status: m.isClosed ? 'Completed' : 'Active',
          })) : [];

          const mappedFuel = Array.isArray(fuelRes) ? fuelRes.map((f: any) => ({
            id: String(f.id),
            vehicleId: String(f.vehicleId),
            vehicleName: f.vehicle?.model || `Vehicle #${f.vehicleId}`,
            date: new Date(f.date).toISOString().split('T')[0],
            liters: f.liters,
            costPerLiter: f.liters > 0 ? f.cost / f.liters : 0,
            total: f.cost,
          })) : [];

          const mappedExpenses = Array.isArray(expensesRes) ? expensesRes.map((e: any) => ({
            id: String(e.id),
            tripId: String(e.vehicleId),
            vehicleId: String(e.vehicleId),
            vehicleName: e.vehicle?.model || `Vehicle #${e.vehicleId}`,
            toll: e.type === 'Toll' ? e.cost : 0,
            other: e.type !== 'Toll' ? e.cost : 0,
            maintenanceCost: 0,
            total: e.cost,
            status: 'Completed',
          })) : [];

          set({
            vehicles: mappedVehicles,
            drivers: mappedDrivers,
            trips: mappedTrips,
            maintenance: mappedMaintenance,
            fuelLogs: mappedFuel,
            expenses: mappedExpenses,
          });
        } catch (err) {
          console.error('Failed to load initial data:', err);
        }
      },

      addVehicle: async (v) => {
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regNumber: v.regNo,
            model: v.name,
            type: v.type,
            maxCapacityKg: v.capacityKg,
            odometer: v.odometer,
            acquisitionCost: v.acquisitionCost,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create vehicle');
        }
        await get().fetchInitialData();
      },

      updateVehicle: async (v) => {
        const res = await fetch(`/api/vehicles/${v.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regNumber: v.regNo,
            model: v.name,
            type: v.type,
            maxCapacityKg: v.capacityKg,
            odometer: v.odometer,
            acquisitionCost: v.acquisitionCost,
            status: v.status,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update vehicle');
        }
        await get().fetchInitialData();
      },

      deleteVehicle: async (id) => {
        const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to delete vehicle');
        }
        await get().fetchInitialData();
      },

      addDriver: async (d) => {
        const res = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: d.name,
            licenseNumber: d.licenseNo,
            category: d.licenseCategory,
            expiryDate: new Date(d.licenseExpiry).toISOString(),
            contactNumber: d.contact,
            safetyScore: d.safetyScore,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create driver');
        }
        await get().fetchInitialData();
      },

      updateDriver: async (d) => {
        const res = await fetch(`/api/drivers/${d.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: d.name,
            licenseNumber: d.licenseNo,
            category: d.licenseCategory,
            expiryDate: new Date(d.licenseExpiry).toISOString(),
            contactNumber: d.contact,
            safetyScore: d.safetyScore,
            status: d.status,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update driver');
        }
        await get().fetchInitialData();
      },

      deleteDriver: async (id) => {
        const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to delete driver');
        }
        await get().fetchInitialData();
      },

      addTrip: async (t) => {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: t.source,
            destination: t.destination,
            cargoWeightKg: t.cargoWeight,
            plannedDistance: t.plannedDistance,
            vehicleId: parseInt(t.vehicleId),
            driverId: parseInt(t.driverId),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create trip');
        }
        await get().fetchInitialData();
      },

      updateTrip: async (t, updates) => {
        let endpoint = `/api/trips/${t.id}/dispatch`;
        let body = {};
        if (t.status === 'Completed') {
          endpoint = `/api/trips/${t.id}/complete`;
          body = {
            endOdometer: updates?.endOdometer || 0,
            fuelConsumed: updates?.fuelConsumed || 0,
          };
        } else if (t.status === 'Cancelled') {
          endpoint = `/api/trips/${t.id}/cancel`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to transition trip status');
        }
        await get().fetchInitialData();
      },

      addMaintenance: async (m) => {
        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: m.serviceType,
            cost: m.cost,
            vehicleId: parseInt(m.vehicleId),
            isClosed: m.status === 'Completed',
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to log maintenance record');
        }
        await get().fetchInitialData();
      },

      updateMaintenance: async (m) => {
        // If marking as completed, call the backend close endpoint which also
        // restores the vehicle status to Available.
        if (m.status === 'Completed') {
          const res = await fetch(`/api/maintenance/${m.id}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to close maintenance record');
          }
          await get().fetchInitialData();
        } else {
          // For other updates just patch local state
          set((s) => ({
            maintenance: s.maintenance.map((x) => (x.id === m.id ? m : x)),
          }));
        }
      },

      addFuelLog: async (f) => {
        const res = await fetch('/api/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            liters: f.liters,
            cost: f.costPerLiter * f.liters,
            vehicleId: parseInt(f.vehicleId),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to log fuel entry');
        }
        await get().fetchInitialData();
      },

      addExpense: async (e) => {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: e.toll > 0 ? 'Toll' : 'Other',
            cost: e.toll > 0 ? e.toll : e.other,
            vehicleId: parseInt(e.vehicleId),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to log expense');
        }
        await get().fetchInitialData();
      },

      updateSettings: (s) => set({ settings: s }),
    }),
    { name: 'fleetops-store' }
  )
);
