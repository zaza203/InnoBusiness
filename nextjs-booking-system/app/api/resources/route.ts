import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const createSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  capacity: z.number().int().positive(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
});

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: List resources
 */
export async function GET() {
  const auth = await requireRole([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;
  const resources = await prisma.resource.findMany({ include: { owner: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(resources);
}

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a resource (admin only)
 */
export async function POST(req: Request) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const resource = await prisma.resource.create({ data: { ...parsed.data, ownerId: auth.user.id } });
  return NextResponse.json(resource, { status: 201 });
}
