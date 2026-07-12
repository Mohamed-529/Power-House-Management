// Auth
export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Vehicle
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Van' | 'Truck' | 'Mini' | 'Bus';

export interface Vehicle {
  id: string;
  regNo: string;
  name: string;
  type: VehicleType;
  capacity: string; // e.g. "500 kg", "5 Ton"
  capacityKg: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
}

// Driver
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type LicenseCategory = 'LMV' | 'HMV';

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  licenseCategory: LicenseCategory;
  licenseExpiry: string; // ISO date
  contact: string;
  tripCompleted: number;
  safetyScore: number;
  status: DriverStatus;
}

// Trip
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  cargoWeight: number;
  plannedDistance: number;
  status: TripStatus;
  eta?: string;
  createdAt: string;
}

// Maintenance
export type MaintenanceStatus = 'Active' | 'Completed';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
}

// Fuel / Expense
export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  liters: number;
  costPerLiter: number;
  total: number;
}

export interface ExpenseRecord {
  id: string;
  tripId: string;
  vehicleId: string;
  vehicleName: string;
  toll: number;
  other: number;
  maintenanceCost: number;
  total: number;
  status: TripStatus;
}

// Settings
export interface OrgSettings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

export interface RBACRow {
  role: Role;
  fleet: 'Full' | 'View' | '—';
  drivers: 'Full' | 'View' | '—';
  trips: 'Full' | 'View' | '—';
  fuelExp: 'Full' | 'View' | '—';
  analytics: 'Full' | 'View' | '—';
}
