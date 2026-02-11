import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logActivity } from '@/lib/activity';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(['MEETING_ROOM', 'VEHICLE']).optional(),
  location: z.string().min(2).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
    include: { images: true, reviews: true, owner: { select: { id: true, name: true, email: true } } }
  });

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
  }

  return NextResponse.json(resource);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.resource.update({ where: { id: params.id }, data: parsed.data });
  await logActivity('UPDATE_RESOURCE', 'RESOURCE', updated.id, auth.user.id);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  await prisma.resource.delete({ where: { id: params.id } });
  await logActivity('DELETE_RESOURCE', 'RESOURCE', params.id, auth.user.id);
  return NextResponse.json({ ok: true });
}
