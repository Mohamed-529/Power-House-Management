import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehicleSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const where = status ? { status: status as any } : {};
    const vehicles = await prisma.vehicle.findMany({ where, orderBy: { id: 'desc' } });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = vehicleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({ where: { regNumber: validation.data.regNumber } });
    if (existing) {
      return NextResponse.json({ error: "Registration number must be unique" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({ data: validation.data });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
