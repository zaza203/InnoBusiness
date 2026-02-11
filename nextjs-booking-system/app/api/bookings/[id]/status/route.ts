import { BookingStatus, NotificationType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logActivity } from '@/lib/activity';
import { queueEmailNotification } from '@/lib/notifications';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  status: z.nativeEnum(BookingStatus),
  approvalComment: z.string().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      approvalComment: parsed.data.approvalComment
    }
  });

  await queueEmailNotification(
    booking.customerId,
    NotificationType.BOOKING_CONFIRMATION,
    `Booking ${parsed.data.status.toLowerCase()}`,
    `Your booking ${booking.title} has been ${parsed.data.status.toLowerCase()}.`
  );

  await logActivity('UPDATE_BOOKING_STATUS', 'BOOKING', booking.id, auth.user.id, { status: parsed.data.status });

  return NextResponse.json(booking);
}
