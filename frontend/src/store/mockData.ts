import type { Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, ExpenseRecord } from '../types';

export const mockVehicles: Vehicle[] = [
  { id: 'v1', regNo: 'GJ01AB4521', name: 'VAN-05', type: 'Van', capacity: '500 kg', capacityKg: 500, odometer: 74000, acquisitionCost: 620000, status: 'Available', region: 'North' },
  { id: 'v2', regNo: 'GJ01AB3981', name: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', capacityKg: 5000, odometer: 182000, acquisitionCost: 2450000, status: 'On Trip', region: 'South' },
  { id: 'v3', regNo: 'GJ01AB8120', name: 'MINI-03', type: 'Mini', capacity: '1 Ton', capacityKg: 1000, odometer: 66000, acquisitionCost: 410000, status: 'In Shop', region: 'East' },
  { id: 'v4', regNo: 'GJ01AB0008', name: 'VAN-09', type: 'Van', capacity: '750 kg', capacityKg: 750, odometer: 241900, acquisitionCost: 590000, status: 'Retired', region: 'West' },
  { id: 'v5', regNo: 'GJ01AC1201', name: 'TRUCK-04', type: 'Truck', capacity: '8 Ton', capacityKg: 8000, odometer: 95000, acquisitionCost: 3200000, status: 'Available', region: 'North' },
  { id: 'v6', regNo: 'GJ01AC3345', name: 'VAN-12', type: 'Van', capacity: '500 kg', capacityKg: 500, odometer: 41000, acquisitionCost: 580000, status: 'Available', region: 'South' },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Alex', licenseNo: 'DL-88213', licenseCategory: 'LMV', licenseExpiry: '2028-12-01', contact: '98765xxxxx', tripCompleted: 96, safetyScore: 96, status: 'Available' },
  { id: 'd2', name: 'John', licenseNo: 'DL-44120', licenseCategory: 'HMV', licenseExpiry: '2025-03-01', contact: '98220xxxxx', tripCompleted: 81, safetyScore: 81, status: 'Suspended' },
  { id: 'd3', name: 'Priya', licenseNo: 'DL-77031', licenseCategory: 'LMV', licenseExpiry: '2027-09-15', contact: '99110xxxxx', tripCompleted: 99, safetyScore: 99, status: 'On Trip' },
  { id: 'd4', name: 'Suresh', licenseNo: 'DL-90045', licenseCategory: 'HMV', licenseExpiry: '2027-01-20', contact: '97440xxxxx', tripCompleted: 88, safetyScore: 88, status: 'Available' },
];

export const mockTrips: Trip[] = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'v1', vehicleName: 'VAN-05', driverId: 'd1', driverName: 'Alex', cargoWeight: 400, plannedDistance: 35, status: 'Dispatched', eta: '45 min', createdAt: '2026-07-12T08:00:00Z' },
  { id: 'TR002', source: 'Surat Depot', destination: 'Vadodara Hub', vehicleId: 'v2', vehicleName: 'TRUCK-11', driverId: 'd3', driverName: 'Priya', cargoWeight: 4000, plannedDistance: 120, status: 'Completed', eta: '—', createdAt: '2026-07-11T10:00:00Z' },
  { id: 'TR003', source: 'Rajkot Depot', destination: 'Ahmedabad Hub', vehicleId: 'v6', vehicleName: 'VAN-12', driverId: 'd4', driverName: 'Suresh', cargoWeight: 300, plannedDistance: 200, status: 'Dispatched', eta: 'In 10m', createdAt: '2026-07-12T07:30:00Z' },
  { id: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: '', vehicleName: '—', driverId: '', driverName: '—', cargoWeight: 0, plannedDistance: 0, status: 'Draft', eta: 'Awaiting vehicle', createdAt: '2026-07-12T09:00:00Z' },
  { id: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicleId: '', vehicleName: '', driverId: '', driverName: '', cargoWeight: 0, plannedDistance: 0, status: 'Cancelled', eta: 'Vehicle went to shop', createdAt: '2026-07-10T06:00:00Z' },
];

export const mockMaintenance: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v1', vehicleName: 'VAN-05', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Active' },
  { id: 'm2', vehicleId: 'v2', vehicleName: 'TRUCK-11', serviceType: 'Engine Repair', cost: 18000, date: '2026-07-06', status: 'Completed' },
  { id: 'm3', vehicleId: 'v3', vehicleName: 'MINI-03', serviceType: 'Tyre Replace', cost: 6200, date: '2026-07-07', status: 'Active' },
];

export const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', vehicleName: 'VAN-05', date: '2026-07-05', liters: 42, costPerLiter: 75, total: 3150 },
  { id: 'f2', vehicleId: 'v2', vehicleName: 'TRUCK-11', date: '2026-07-06', liters: 112, costPerLiter: 75, total: 8400 },
  { id: 'f3', vehicleId: 'v3', vehicleName: 'MINI-08', date: '2026-07-06', liters: 28, costPerLiter: 75, total: 2050 },
];

export const mockExpenses: ExpenseRecord[] = [
  { id: 'e1', tripId: 'TR001', vehicleId: 'v1', vehicleName: 'VAN-05', toll: 120, other: 0, maintenanceCost: 0, total: 120, status: 'Dispatched' },
  { id: 'e2', tripId: 'TR002', vehicleId: 'v2', vehicleName: 'TRUCK-11', toll: 340, other: 150, maintenanceCost: 18000, total: 18490, status: 'Completed' },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 180000 },
  { month: 'Feb', revenue: 210000 },
  { month: 'Mar', revenue: 195000 },
  { month: 'Apr', revenue: 240000 },
  { month: 'May', revenue: 260000 },
  { month: 'Jun', revenue: 280000 },
  { month: 'Jul', revenue: 255000 },
  { month: 'Aug', revenue: 310000 },
  { month: 'Sep', revenue: 290000 },
];
