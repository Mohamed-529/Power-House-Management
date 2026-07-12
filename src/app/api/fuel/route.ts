import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fuelLogSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const where = vehicleId ? { vehicleId: parseInt(vehicleId) } : {};
    const logs = await prisma.fuelLog.findMany({ where, include: { vehicle: true }, orderBy: { date: 'desc' } });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = fuelLogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }
    
    const log = await prisma.fuelLog.create({ data: validation.data });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
