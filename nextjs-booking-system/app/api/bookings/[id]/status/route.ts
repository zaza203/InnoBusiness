import { BookingStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const schema = z.object({ status: z.nativeEnum(BookingStatus) });

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Admin updates booking status
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.error) return auth.error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: { resource: true, customer: true }
  });
  return NextResponse.json(booking);
}
