import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { 
        maintenanceLogs: { select: { cost: true } },
        fuelLogs: { select: { cost: true, liters: true } },
        trips: { select: { plannedDistance: true } }
      }
    });

    // Format data for CSV
    const csvRows = [
      "Vehicle Model,Reg Number,Status,Total Maintenance Cost,Total Fuel Cost,Total Distance (km)",
      ...vehicles.map(v => {
        const maintCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
        const fuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
        const distance = v.trips.reduce((s, t) => s + t.plannedDistance, 0);
        // Wrap in quotes to handle commas in names
        return `"${v.model}","${v.regNumber}","${v.status}",${maintCost},${fuelCost},${distance}`;
      })
    ];

    const csvString = csvRows.join('\n');
    
    // Return as a downloadable CSV file
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=transitops_report.csv'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 });
  }
}
