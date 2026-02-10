import { BookingStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const createSchema = z.object({
  resourceId: z.string().min(1),
  title: z.string().min(2),
  notes: z.string().optional(),
  startAt: z.string(),
  endAt: z.string()
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: List bookings by role
 */
export async function GET() {
  const auth = await requireRole([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;
  const where = auth.user.role === Role.ADMIN ? {} : { customerId: auth.user.id };
  const bookings = await prisma.booking.findMany({
    where,
    include: { resource: true, customer: true },
    orderBy: { startAt: 'asc' }
  });
  return NextResponse.json(bookings);
}

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create booking (customer/admin)
 */
export async function POST(req: Request) {
  const auth = await requireRole([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (startAt >= endAt) return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
  if (startAt <= new Date()) return NextResponse.json({ error: 'Start must be in the future.' }, { status: 400 });

  const overlaps = await prisma.booking.count({
    where: {
      resourceId: parsed.data.resourceId,
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    }
  });
  if (overlaps > 0) {
    return NextResponse.json({ error: 'Resource already booked for this period.' }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      ...parsed.data,
      startAt,
      endAt,
      customerId: auth.user.id
    },
    include: { resource: true, customer: true }
  });
  return NextResponse.json(booking, { status: 201 });
}
