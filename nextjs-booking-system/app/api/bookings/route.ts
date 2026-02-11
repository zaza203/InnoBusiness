import { BookingStatus, NotificationType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  durationInHours,
  hasOverlap,
  isAlignedToSlot,
  MAX_BOOKING_DURATION_HOURS
} from '@/lib/booking-rules';
import { logActivity } from '@/lib/activity';
import { queueEmailNotification } from '@/lib/notifications';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  resourceId: z.string().min(1),
  title: z.string().min(2),
  notes: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  recurring: z.object({ occurrences: z.number().int().min(1).max(12), frequencyDays: z.number().int().min(1).max(30) }).optional()
});

export async function GET(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as BookingStatus | null;
  const where = {
    status: status ?? undefined,
    ...(auth.user.role === Role.ADMIN ? {} : { customerId: auth.user.id })
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      resource: { include: { images: true } },
      customer: { select: { id: true, name: true, email: true } },
      payment: true
    },
    orderBy: { startAt: 'asc' }
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  const now = new Date();

  if (startAt >= endAt) {
    return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
  }

  if (startAt < now) {
    return NextResponse.json({ error: 'Cannot book in the past.' }, { status: 400 });
  }

  if (!isAlignedToSlot(startAt) || !isAlignedToSlot(endAt)) {
    return NextResponse.json({ error: 'Bookings must use 30-minute increments.' }, { status: 400 });
  }

  if (durationInHours(startAt, endAt) > MAX_BOOKING_DURATION_HOURS) {
    return NextResponse.json({ error: `Max booking duration is ${MAX_BOOKING_DURATION_HOURS} hours.` }, { status: 400 });
  }

  const occurrences = parsed.data.recurring?.occurrences ?? 1;
  const frequencyDays = parsed.data.recurring?.frequencyDays ?? 0;
  const createdBookings: { id: string; startAt: Date; endAt: Date }[] = [];

  for (let i = 0; i < occurrences; i += 1) {
    const currentStart = new Date(startAt.getTime() + i * frequencyDays * 24 * 60 * 60 * 1000);
    const currentEnd = new Date(endAt.getTime() + i * frequencyDays * 24 * 60 * 60 * 1000);

    const overlap = await hasOverlap(parsed.data.resourceId, currentStart, currentEnd);
    if (overlap) {
      await prisma.waitingList.create({
        data: {
          resourceId: parsed.data.resourceId,
          customerId: auth.user.id,
          preferredStartAt: currentStart,
          preferredEndAt: currentEnd
        }
      });
      continue;
    }

    const booking = await prisma.booking.create({
      data: {
        resourceId: parsed.data.resourceId,
        customerId: auth.user.id,
        title: parsed.data.title,
        notes: parsed.data.notes,
        startAt: currentStart,
        endAt: currentEnd,
        recurringRule: parsed.data.recurring ? JSON.stringify(parsed.data.recurring) : null,
        status: auth.user.role === Role.ADMIN ? BookingStatus.APPROVED : BookingStatus.PENDING
      }
    });

    createdBookings.push({ id: booking.id, startAt: booking.startAt, endAt: booking.endAt });

    await queueEmailNotification(
      auth.user.id,
      NotificationType.BOOKING_CONFIRMATION,
      'Booking request received',
      `Your booking ${booking.title} for ${booking.startAt.toISOString()} is ${booking.status.toLowerCase()}.`
    );

    await logActivity('CREATE_BOOKING', 'BOOKING', booking.id, auth.user.id, {
      recurring: Boolean(parsed.data.recurring)
    });
  }

  return NextResponse.json({
    createdCount: createdBookings.length,
    createdBookings,
    waitingListedCount: occurrences - createdBookings.length
  }, { status: 201 });
}
