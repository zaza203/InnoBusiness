import { BookingStatus } from '@prisma/client';

import { prisma } from './prisma';

export const SLOT_MINUTES = 30;
export const MAX_BOOKING_DURATION_HOURS = 8;

export function isAlignedToSlot(date: Date) {
  return date.getUTCMinutes() % SLOT_MINUTES === 0;
}

export function durationInHours(startAt: Date, endAt: Date) {
  return (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
}

export async function hasOverlap(resourceId: string, startAt: Date, endAt: Date, excludeBookingId?: string) {
  const count = await prisma.booking.count({
    where: {
      resourceId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    }
  });

  return count > 0;
}
