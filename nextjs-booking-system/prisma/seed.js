const crypto = require('node:crypto');
const { PrismaClient, Role, ResourceType, ResourceStatus } = require('@prisma/client');

const prisma = new PrismaClient();
const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gia.local' },
    update: {
      name: 'Platform Admin',
      role: Role.ADMIN,
      passwordHash: hashPassword('Password123!')
    },
    create: {
      name: 'Platform Admin',
      email: 'admin@gia.local',
      role: Role.ADMIN,
      passwordHash: hashPassword('Password123!')
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@gia.local' },
    update: {
      name: 'Demo Customer',
      role: Role.CUSTOMER,
      passwordHash: hashPassword('Password123!')
    },
    create: {
      name: 'Demo Customer',
      email: 'customer@gia.local',
      role: Role.CUSTOMER,
      passwordHash: hashPassword('Password123!')
    }
  });

  const boardroom = await prisma.resource.upsert({
    where: { id: 'seed-boardroom-a' },
    update: {},
    create: {
      id: 'seed-boardroom-a',
      name: 'Boardroom A',
      type: ResourceType.MEETING_ROOM,
      location: 'HQ Level 2',
      capacity: 14,
      description: 'Main conference room with display wall.',
      status: ResourceStatus.ACTIVE,
      ownerId: admin.id
    }
  });

  await prisma.resourceImage.createMany({
    data: [
      {
        resourceId: boardroom.id,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      },
      {
        resourceId: boardroom.id,
        imageUrl: 'https://images.unsplash.com/photo-1517502166878-35c93a0072f0?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    skipDuplicates: true
  });

  await prisma.booking.createMany({
    data: [
      {
        title: 'Weekly strategy sync',
        notes: 'Seed sample booking',
        resourceId: boardroom.id,
        customerId: customer.id,
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'APPROVED'
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
