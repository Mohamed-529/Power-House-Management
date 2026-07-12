import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Clean existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  await prisma.user.create({
    data: {
      email: 'admin@transitops.com',
      password: 'password123',
      name: 'Fleet Administrator',
      role: 'FLEET_MANAGER',
    },
  });

  // 3. Seed Vehicles
  const v1 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-12-QW-1111',
      model: 'Tata Ace',
      type: 'Mini Truck',
      maxCapacityKg: 800,
      odometer: 12500,
      acquisitionCost: 550000,
      status: 'AVAILABLE',
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-12-ER-2222',
      model: 'Mahindra Bolero Pickup',
      type: 'Pickup Truck',
      maxCapacityKg: 1500,
      odometer: 28400,
      acquisitionCost: 850000,
      status: 'ON_TRIP',
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-12-TY-3333',
      model: 'Ashok Leyland Dost',
      type: 'Mini Truck',
      maxCapacityKg: 1200,
      odometer: 45000,
      acquisitionCost: 750000,
      status: 'IN_SHOP',
    },
  });

  // 4. Seed Drivers
  const d1 = await prisma.driver.create({
    data: {
      name: 'Ramesh Singh',
      licenseNumber: 'DL-14202100',
      category: 'LMV',
      expiryDate: new Date('2030-12-31'),
      contactNumber: '9876543210',
      safetyScore: 95,
      status: 'AVAILABLE',
    },
  });

  const d2 = await prisma.driver.create({
    data: {
      name: 'Suresh Kumar',
      licenseNumber: 'DL-15202399',
      category: 'HMV',
      expiryDate: new Date('2028-06-15'),
      contactNumber: '9123456789',
      safetyScore: 88,
      status: 'ON_TRIP',
    },
  });

  const d3 = await prisma.driver.create({
    data: {
      name: 'Expired License Driver',
      licenseNumber: 'DL-99200001',
      category: 'LMV',
      expiryDate: new Date('2025-01-01'), // Expired license
      contactNumber: '9900990099',
      safetyScore: 70,
      status: 'AVAILABLE',
    },
  });

  // 5. Seed Trips
  await prisma.trip.create({
    data: {
      source: 'Mumbai Warehouse A',
      destination: 'Pune Distribution Center',
      cargoWeightKg: 1000,
      plannedDistance: 150,
      status: 'COMPLETED',
      startOdometer: 28000,
      endOdometer: 28150,
      fuelConsumed: 12,
      vehicleId: v2.id,
      driverId: d2.id,
    },
  });

  // 6. Seed Maintenance Logs
  await prisma.maintenanceLog.create({
    data: {
      description: 'Periodic Brake Pad Replacement',
      cost: 4500,
      isClosed: true,
      vehicleId: v3.id,
    },
  });

  // 7. Seed Fuel Logs
  await prisma.fuelLog.create({
    data: {
      liters: 45,
      cost: 4700,
      vehicleId: v1.id,
    },
  });

  // 8. Seed Expenses
  await prisma.expense.create({
    data: {
      type: 'Toll Tax',
      cost: 350,
      description: 'Mumbai-Pune Expressway Toll',
      vehicleId: v2.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
