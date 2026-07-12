import { Router } from 'express';
import { prisma, catchAsync, validateBody, schemas } from './core_engine';

export const dispatchAnalyticsRouter = Router();

// 1. TRIP LIFECYCLE: Create a trip draft with cargo and weight validation
dispatchAnalyticsRouter.post('/trips', validateBody(schemas.trip), catchAsync(async (req, res) => {
  const { source, destination, cargoWeight, plannedDistance, vehicleId, driverId } = req.body;

  // Business Rule Verification: Check asset conditions before writing
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!vehicle || vehicle.status === 'IN_SHOP' || vehicle.status === 'RETIRED') {
    return res.status(400).json({ error: "Selected vehicle is unavailable or in shop" });
  }
  if (!driver || driver.status === 'SUSPENDED' || new Date(driver.licenseExpiry) < new Date()) {
    return res.status(400).json({ error: "Driver profile is suspended or license has expired" });
  }
  if (cargoWeight > vehicle.maxLoadCapacity) {
    return res.status(400).json({ error: "Cargo weight exceeds the maximum legal load capacity" });
  }

  const draftTrip = await prisma.trip.create({
    data: { source, destination, cargoWeight, plannedDistance, vehicleId, driverId, status: 'DRAFT' }
  });
  res.status(201).json(draftTrip);
}));

// 2. TRIP LIFECYCLE: Atomic Trip Dispatching (Swaps statuses to ON_TRIP simultaneously)
dispatchAnalyticsRouter.post('/trips/:id/dispatch', catchAsync(async (req, res) => {
  const { id } = req.params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return res.status(404).json({ error: "Trip record not found" });

  const updatedRecords = await prisma.$transaction([
    prisma.trip.update({ where: { id }, data: { status: 'DISPATCHED' } }),
    prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } }),
    prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } })
  ]);

  res.json({ message: "Trip successfully dispatched to field operations", trip: updatedRecords[0] });
}));

// 3. ANALYTICS ENGINE: Dashboard KPI summaries
dispatchAnalyticsRouter.get('/dashboard', catchAsync(async (req, res) => {
  const totalVehicles = await prisma.vehicle.count();
  const activeTrips = await prisma.trip.count({ where: { status: 'DISPATCHED' } });
  const availableVehicles = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });

  res.json({
    kpis: {
      totalVehicles,
      activeTrips,
      availableVehicles,
      fleetUtilizationPct: totalVehicles > 0 ? (activeTrips / totalVehicles) * 100 : 0
    }
  });
}));
