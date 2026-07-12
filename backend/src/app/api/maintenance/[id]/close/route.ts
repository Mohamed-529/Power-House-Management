import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: 'Invalid maintenance ID' }, { status: 400 });
    }

    const log = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
    if (!log) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }
    if (log.isClosed) {
      return NextResponse.json({ error: 'Maintenance record is already closed' }, { status: 400 });
    }

    // Close the log AND restore vehicle to AVAILABLE atomically
    const [updated] = await prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id: logId },
        data: { isClosed: true, endDate: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
