import { BookingStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (auth.user.role === Role.CUSTOMER && booking.customerId !== auth.user.id) {
    return NextResponse.json({ error: 'Cannot cancel other customer bookings.' }, { status: 403 });
  }

  const cancelled = await prisma.booking.update({
    where: { id: params.id },
    data: { status: BookingStatus.CANCELLED }
  });
  return NextResponse.json(cancelled);
}
