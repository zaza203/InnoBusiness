import { BookingStatus, NotificationType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { queueEmailNotification } from '@/lib/notifications';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const now = new Date();
  const oneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      startAt: { gte: now, lte: oneHour },
      status: BookingStatus.APPROVED
    }
  });

  for (const booking of upcomingBookings) {
    await queueEmailNotification(
      booking.customerId,
      NotificationType.BOOKING_REMINDER,
      'Booking reminder',
      `Reminder: booking ${booking.title} starts at ${booking.startAt.toISOString()}.`
    );
  }

  return NextResponse.json({ sent: upcomingBookings.length });
}
