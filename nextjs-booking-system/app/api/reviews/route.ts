import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  resourceId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export async function GET(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');

  const reviews = await prisma.review.findMany({
    where: { resourceId: resourceId ?? undefined },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const auth = await requireAuth([Role.CUSTOMER, Role.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      resourceId: parsed.data.resourceId,
      customerId: auth.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment
    }
  });

  return NextResponse.json(review, { status: 201 });
}
