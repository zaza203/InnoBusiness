import { Role } from '@prisma/client';
import { z } from 'zod';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.error) return auth.error;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const resource = await prisma.resource.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(resource);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.error) return auth.error;
  await prisma.resource.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
