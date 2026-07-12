import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query; 


  if (req.method === 'POST' && !action) {
    const { source, destination, cargoWeight, plannedDistance, vehicleId, driverId } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });

    if (!vehicle || vehicle.status === 'IN_SHOP' || vehicle.status === 'RETIRED') {
      return res.status(400).json({ error: "Selected vehicle is retired or currently in the maintenance shop" });
    }
    if (!driver || driver.status === 'SUSPENDED' || new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({ error: "Driver profile is suspended or license has expired" });
    }
    if (vehicle.status === 'ON_TRIP') {
      return res.status(400).json({ error: "The selected vehicle is currently deployed on another active trip" });
    }
    if (driver.status === 'ON_TRIP') {
      return res.status(400).json({ error: "The selected driver is currently deployed on another active trip" });
    }
    if (parseFloat(cargoWeight) > vehicle.maxLoadCapacity) {
      return res.status(400).json({ error: `Cargo load weight exceeds the vehicle maximum capacity limit of ${vehicle.maxLoadCapacity} kg` });
    }

    const draftTrip = await prisma.trip.create({
      data: {
        source,
        destination,
        cargoWeight: parseFloat(cargoWeight),
        plannedDistance: parseFloat(plannedDistance),
        vehicleId,
        driverId,
        status: 'DRAFT'
      }
    });
    return res.status(201).json(draftTrip);
  }

  if (req.method === 'POST' && action === 'dispatch') {
    const tripId = id as string;
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: "Trip record not found" });

    const updatedState = await prisma.$transaction([
      prisma.trip.update({ where: { id: tripId }, data: { status: 'DISPATCHED' } }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } })
    ]);

    return res.status(200).json({ message: "Trip successfully dispatched into field operations", data: updatedState });
  }

  // 3. COMPLETE TRIP ACTION (POST /api/trips?id=XYZ&action=complete)
  if (req.method === 'POST' && action === 'complete') {
    const tripId = id as string;
    const { finalOdometer, litersConsumed, fuelCost, tollCost, otherCost } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: "Trip record not found" });

    await prisma.$transaction([

      prisma.trip.update({ where: { id: tripId }, data: { status: 'COMPLETED' } }),

      prisma.fuelLog.create({
        data: { vehicleId: trip.vehicleId, date: new Date(), liters: parseFloat(litersConsumed), cost: parseFloat(fuelCost) }
      }),
   
      prisma.expense.create({
        data: { tripId, tollCost: parseFloat(tollCost), otherCost: parseFloat(otherCost) }
      }),
 
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE', odometer: parseFloat(finalOdometer) }
      }),

      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } })
    ]);

    return res.status(200).json({ message: "Trip logged as completed. Assets safely released back to active pool." });
  }


  if (req.method === 'POST' && action === 'cancel') {
    const tripId = id as string;
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: "Trip record not found" });

    const rolledBackState = await prisma.$transaction([
      prisma.trip.update({ where: { id: tripId }, data: { status: 'CANCELLED' } }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } })
    ]);

    return res.status(200).json({ message: "Trip cancelled. Assets released to pool.", data: rolledBackState });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
