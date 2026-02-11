import { BookingStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as BookingStatus | null;

  const bookings = await prisma.booking.findMany({
    where: { status: status ?? undefined },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      resource: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(bookings);
}
