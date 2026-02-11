import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ imageUrl: z.string().url() });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const image = await prisma.resourceImage.create({
    data: {
      resourceId: params.id,
      imageUrl: parsed.data.imageUrl
    }
  });

  return NextResponse.json(image, { status: 201 });
}
