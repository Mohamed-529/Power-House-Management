import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get basic counts
    const totalVehicles = await prisma.vehicle.count();
    const availableVehicles = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
    const inShopVehicles = await prisma.vehicle.count({ where: { status: 'IN_SHOP' } });
    const onTripVehicles = await prisma.vehicle.count({ where: { status: 'ON_TRIP' } });
    const driversOnDuty = await prisma.driver.count({ where: { status: 'ON_TRIP' } });
    
    // 2. Calculate Fleet Utilization %
    const utilization = totalVehicles > 0 ? Math.round((onTripVehicles / totalVehicles) * 100) : 0;

    // 3. Calculate Vehicle ROI & Costs
    const vehicles = await prisma.vehicle.findMany({
      include: {
        maintenanceLogs: { select: { cost: true } },
        fuelLogs: { select: { cost: true, liters: true } },
        expenses: { select: { cost: true } },
        trips: { select: { plannedDistance: true } }
      }
    });

    const roiData = vehicles.map(v => {
      const maintCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const fuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const otherCost = v.expenses.reduce((s, e) => s + e.cost, 0);
      const totalDistance = v.trips.reduce((s, t) => s + t.plannedDistance, 0);
      const totalFuel = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
      
      const totalCost = maintCost + fuelCost + otherCost;
      const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
      
      // Mock revenue = totalCost * 1.5 for demo purposes
      const mockRevenue = totalCost * 1.5; 
      const roi = v.acquisitionCost > 0 ? ((mockRevenue - totalCost) / v.acquisitionCost) * 100 : 0;

      return {
        vehicleName: `${v.model} (${v.regNumber})`,
        maintCost,
        fuelCost,
        totalCost,
        fuelEfficiency: fuelEfficiency.toFixed(2),
        roi: roi.toFixed(2)
      };
    });

    return NextResponse.json({
      kpis: { totalVehicles, availableVehicles, inShopVehicles, driversOnDuty, utilization },
      roiMatrix: roiData
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
