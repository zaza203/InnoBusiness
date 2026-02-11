import { BookingStatus, NotificationType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logActivity } from '@/lib/activity';
import { queueEmailNotification } from '@/lib/notifications';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ reason: z.string().optional() });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (auth.user.role === Role.CUSTOMER && booking.customerId !== auth.user.id) {
    return NextResponse.json({ error: 'You can cancel only your own bookings.' }, { status: 403 });
  }

  const cancelled = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: parsed.data.reason
    }
  });

  await queueEmailNotification(
    cancelled.customerId,
    NotificationType.BOOKING_CANCELLATION,
    'Booking cancelled',
    `Booking ${cancelled.title} has been cancelled.`
  );

  await logActivity('CANCEL_BOOKING', 'BOOKING', cancelled.id, auth.user.id);

  return NextResponse.json(cancelled);
}
