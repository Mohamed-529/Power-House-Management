import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const where: any = status ? { status: status as any } : {};
    
    // If frontend asks for available drivers, filter out expired licenses too!
    if (status === 'AVAILABLE') {
      where.expiryDate = { gt: new Date() };
    }

    const drivers = await prisma.driver.findMany({ where, orderBy: { id: 'desc' } });
    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = driverSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const existing = await prisma.driver.findUnique({ where: { licenseNumber: validation.data.licenseNumber } });
    if (existing) {
      return NextResponse.json({ error: "License number must be unique" }, { status: 400 });
    }

    const driver = await prisma.driver.create({ data: validation.data });
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
