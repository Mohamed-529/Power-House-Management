import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  // 1. Gather master structural counts
  const totalVehicles = await prisma.vehicle.count();
  const activeVehicles = await prisma.vehicle.count({ where: { status: 'ON_TRIP' } });
  const availableVehicles = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
  const vehiclesInShop = await prisma.vehicle.count({ where: { status: 'IN_SHOP' } });
  const activeTrips = await prisma.trip.count({ where: { status: 'DISPATCHED' } });
  const pendingTrips = await prisma.trip.count({ where: { status: 'DRAFT' } });
  const driversOnDuty = await prisma.driver.count({ where: { status: 'ON_TRIP' } });

  // 2. Fetch fleet elements to construct the detailed Financial ROI Matrix
  const vehiclesData = await prisma.vehicle.findMany({
    include: {
      fuelLogs: true,
      maintenanceLogs: true,
      trips: true,
    }
  });

  const vehicleRoiMatrix = vehiclesData.map((vehicle) => {
    // A. Sum up operational fuel costs
    const totalFuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + log.cost, 0);

    // B. Sum up maintenance costs
    const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);

    // C. Calculate trip revenue (e.g., using a hackathon standard baseline of 40 INR / 0.5 USD per distance unit)
    const totalRevenue = vehicle.trips
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, trip) => sum + (trip.plannedDistance * 40), 0);

    // D. Compute the mandatory ROI formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const netEarnings = totalRevenue - (totalMaintenanceCost + totalFuelCost);
    const roiPercentage = vehicle.acquisitionCost > 0 
      ? (netEarnings / vehicle.acquisitionCost) * 100 
      : 0;

    return {
      id: vehicle.id,
      regNumber: vehicle.regNumber,
      nameModel: vehicle.nameModel,
      totalFuelCost,
      totalMaintenanceCost,
      totalRevenue,
      roiPercentage: parseFloat(roiPercentage.toFixed(2))
    };
  });

  // 3. Standardize and send back the clean dashboard payloads
  return res.status(200).json({
    kpis: {
      activeVehicles,
      availableVehicles,
      vehiclesInShop,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPct: totalVehicles > 0 ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(1)) : 0
    },
    roiMatrix: vehicleRoiMatrix
  });
}
