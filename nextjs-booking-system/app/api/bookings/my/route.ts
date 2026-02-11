import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const now = new Date();
  const baseWhere = auth.user.role === Role.ADMIN ? {} : { customerId: auth.user.id };

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { ...baseWhere, startAt: { gte: now } },
      include: { resource: true },
      orderBy: { startAt: 'asc' }
    }),
    prisma.booking.findMany({
      where: { ...baseWhere, endAt: { lt: now } },
      include: { resource: true },
      orderBy: { endAt: 'desc' }
    })
  ]);

  return NextResponse.json({ upcoming, past });
}
