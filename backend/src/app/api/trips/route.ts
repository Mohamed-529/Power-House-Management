import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tripSchema } from '@/lib/validations';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = tripSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { vehicleId, driverId, cargoWeightKg } = validation.data;

    // 1. Validate Vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      return NextResponse.json({ error: "Vehicle is not available for dispatch" }, { status: 400 });
    }
    if (cargoWeightKg > vehicle.maxCapacityKg) {
      return NextResponse.json({ error: `Cargo exceeds max capacity of ${vehicle.maxCapacityKg}kg` }, { status: 400 });
    }

    // 2. Validate Driver
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.status !== 'AVAILABLE') {
      return NextResponse.json({ error: "Driver is not available for dispatch" }, { status: 400 });
    }
    if (driver.expiryDate < new Date()) {
      return NextResponse.json({ error: "Driver's license has expired" }, { status: 400 });
    }

    // 3. Create Trip as DRAFT
    const trip = await prisma.trip.create({ 
      data: { 
        ...validation.data, 
        status: 'DRAFT',
        startOdometer: vehicle.odometer 
      } 
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const where = status ? { status: status as any } : {};
    const trips = await prisma.trip.findMany({ 
      where, 
      include: { vehicle: true, driver: true }, 
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
