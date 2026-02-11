import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { resource: { include: { images: true } }, customer: { select: { id: true, name: true, email: true } }, payment: true }
  });

  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (auth.user.role === Role.CUSTOMER && booking.customerId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(booking);
}
