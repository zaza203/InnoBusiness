import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const entries = await prisma.waitingList.findMany({
    where: auth.user.role === Role.ADMIN ? {} : { customerId: auth.user.id },
    include: { resource: true },
    orderBy: { requestedAt: 'desc' }
  });

  return NextResponse.json(entries);
}
