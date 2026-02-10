const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gia.local' },
    update: { name: 'GIA Admin', role: Role.ADMIN },
    create: { name: 'GIA Admin', email: 'admin@gia.local', role: Role.ADMIN }
  });

  await prisma.user.upsert({
    where: { email: 'customer@gia.local' },
    update: { name: 'Demo Customer', role: Role.CUSTOMER },
    create: { name: 'Demo Customer', email: 'customer@gia.local', role: Role.CUSTOMER }
  });

  await prisma.resource.createMany({
    data: [
      { name: 'Boardroom A', type: 'MEETING_ROOM', location: 'HQ Floor 2', capacity: 12, ownerId: admin.id },
      { name: 'Toyota Hilux', type: 'VEHICLE', location: 'Parking A', capacity: 5, ownerId: admin.id }
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());
