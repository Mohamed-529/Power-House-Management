import { z } from 'zod';

export const vehicleSchema = z.object({
  regNumber: z.string().min(1, "Registration number is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  maxCapacityKg: z.number().positive("Capacity must be positive"),
  odometer: z.number().default(0),
  acquisitionCost: z.number().positive("Cost must be positive"),
});

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License is required"),
  category: z.string().min(1, "Category is required"),
  expiryDate: z.string().transform((str) => new Date(str)),
  contactNumber: z.string().min(1, "Contact is required"),
  safetyScore: z.number().min(0).max(100).default(100),
});

export const fuelLogSchema = z.object({
  liters: z.number().positive(),
  cost: z.number().positive(),
  vehicleId: z.number().int()
});

export const expenseSchema = z.object({
  type: z.string().min(1, "Type is required"),
  cost: z.number().positive("Cost must be positive"),
  description: z.string().optional(),
  vehicleId: z.number().int()
});

export const tripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistance: z.number().positive(),
  vehicleId: z.number().int(),
  driverId: z.number().int(),
});

export const maintenanceSchema = z.object({
  description: z.string().default(""),
  cost: z.number().nonnegative(),
  vehicleId: z.number().int(),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : null),
  isClosed: z.boolean().default(false),
});

