import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const vehicleId = parseInt(body.vehicleId);
    const cost = parseFloat(body.cost);
    
    if (isNaN(vehicleId) || isNaN(cost)) {
      return NextResponse.json({ error: "Invalid vehicleId or cost" }, { status: 400 });
    }

    // Create log AND update vehicle status to IN_SHOP atomically
    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({ 
        data: { 
          description: body.description || "",
          cost,
          vehicleId,
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
          endDate: body.endDate ? new Date(body.endDate) : null,
          isClosed: body.isClosed || false
        } 
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
