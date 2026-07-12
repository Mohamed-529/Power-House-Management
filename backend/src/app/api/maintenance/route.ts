import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maintenanceSchema } from '@/lib/validations';

export async function GET() {
  try {
    const logs = await prisma.maintenanceLog.findMany({ 
      include: { vehicle: true }, 
      orderBy: { startDate: 'desc' } 
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = maintenanceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { vehicleId } = validation.data;

    // Create log AND update vehicle status to IN_SHOP atomically
    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({ 
        data: validation.data
      }),
      prisma.vehicle.update({ 
        where: { id: vehicleId }, 
        data: { status: 'IN_SHOP' } 
      })
    ]);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

