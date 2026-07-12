import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    const body = await req.json();
    
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.status !== 'DISPATCHED') {
      return NextResponse.json({ error: "Only dispatched trips can be completed" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { 
          status: 'COMPLETED', 
          endOdometer: body.endOdometer, 
          fuelConsumed: body.fuelConsumed 
        }
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE', odometer: body.endOdometer }
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      })
    ]);

    return NextResponse.json({ message: "Trip completed successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to complete trip" }, { status: 500 });
  }
}
