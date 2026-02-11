import { PaymentStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3)
});

export async function POST(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (auth.user.role === Role.CUSTOMER && booking.customerId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: PaymentStatus.PAID,
      providerRef: `SIM-${Date.now()}`
    },
    create: {
      bookingId: booking.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: PaymentStatus.PAID,
      providerRef: `SIM-${Date.now()}`
    }
  });

  return NextResponse.json(payment, { status: 201 });
}
