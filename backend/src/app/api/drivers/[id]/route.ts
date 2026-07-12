import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const driver = await prisma.driver.findUnique({ 
      where: { id: parseInt(id) },
      include: { trips: true }
    });
    if (!driver) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(driver);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.expiryDate && typeof body.expiryDate === 'string') {
      body.expiryDate = new Date(body.expiryDate);
    }
    const driver = await prisma.driver.update({ 
      where: { id: parseInt(id) }, 
      data: body 
    });
    return NextResponse.json(driver);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.driver.delete({ 
      where: { id: parseInt(id) } 
    });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
