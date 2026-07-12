import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip || trip.status !== 'DRAFT') {
      return NextResponse.json({ error: "Only draft trips can be dispatched" }, { status: 400 });
    }

    // ATOMIC TRANSACTION: Update Trip, Vehicle, and Driver simultaneously
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({ where: { id: tripId }, data: { status: 'DISPATCHED' } }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } })
    ]);

    return NextResponse.json(updatedTrip);
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch trip" }, { status: 500 });
  }
}
