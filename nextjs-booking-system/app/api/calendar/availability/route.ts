import { BookingStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!resourceId || !from || !to) {
    return NextResponse.json({ error: 'resourceId, from and to are required.' }, { status: 400 });
  }

  const availability = await prisma.booking.findMany({
    where: {
      resourceId,
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      startAt: { gte: new Date(from) },
      endAt: { lte: new Date(to) }
    },
    orderBy: { startAt: 'asc' }
  });

  return NextResponse.json({ resourceId, blocks: availability });
}
