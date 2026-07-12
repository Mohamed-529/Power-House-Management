import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, ExpenseRecord, OrgSettings } from '../types';
import { mockVehicles, mockDrivers, mockTrips, mockMaintenance, mockFuelLogs, mockExpenses } from './mockData';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  // Drivers
  drivers: Driver[];
  addDriver: (d: Driver) => void;
  updateDriver: (d: Driver) => void;
  deleteDriver: (id: string) => void;

  // Trips
  trips: Trip[];
  addTrip: (t: Trip) => void;
  updateTrip: (t: Trip) => void;

  // Maintenance
  maintenance: MaintenanceRecord[];
  addMaintenance: (m: MaintenanceRecord) => void;
  updateMaintenance: (m: MaintenanceRecord) => void;

  // Fuel
  fuelLogs: FuelLog[];
  addFuelLog: (f: FuelLog) => void;
  expenses: ExpenseRecord[];
  addExpense: (e: ExpenseRecord) => void;

  // Settings
  settings: OrgSettings;
  updateSettings: (s: OrgSettings) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),

      vehicles: mockVehicles,
      addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, v] })),
      updateVehicle: (v) => set((s) => ({ vehicles: s.vehicles.map((x) => (x.id === v.id ? v : x)) })),
      deleteVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((x) => x.id !== id) })),

      drivers: mockDrivers,
      addDriver: (d) => set((s) => ({ drivers: [...s.drivers, d] })),
      updateDriver: (d) => set((s) => ({ drivers: s.drivers.map((x) => (x.id === d.id ? d : x)) })),
      deleteDriver: (id) => set((s) => ({ drivers: s.drivers.filter((x) => x.id !== id) })),

      trips: mockTrips,
      addTrip: (t) => set((s) => ({ trips: [...s.trips, t] })),
      updateTrip: (t) => set((s) => ({ trips: s.trips.map((x) => (x.id === t.id ? t : x)) })),

      maintenance: mockMaintenance,
      addMaintenance: (m) =>
        set((s) => {
          const updated = m.status === 'Active'
            ? s.vehicles.map((v) => v.id === m.vehicleId ? { ...v, status: 'In Shop' as const } : v)
            : s.vehicles.map((v) => v.id === m.vehicleId ? { ...v, status: 'Available' as const } : v);
          return { maintenance: [...s.maintenance, m], vehicles: updated };
        }),
      updateMaintenance: (m) =>
        set((s) => {
          const updated = m.status === 'Completed'
            ? s.vehicles.map((v) => v.id === m.vehicleId ? { ...v, status: 'Available' as const } : v)
            : s.vehicles;
          return { maintenance: s.maintenance.map((x) => (x.id === m.id ? m : x)), vehicles: updated };
        }),

      fuelLogs: mockFuelLogs,
      addFuelLog: (f) => set((s) => ({ fuelLogs: [...s.fuelLogs, f] })),
      expenses: mockExpenses,
      addExpense: (e) => set((s) => ({ expenses: [...s.expenses, e] })),

      settings: { depotName: 'Gandhinagar Depot GJ14', currency: 'INR (₹)', distanceUnit: 'Kilometers' },
      updateSettings: (s) => set({ settings: s }),
    }),
    { name: 'fleetops-store' }
  )
);
