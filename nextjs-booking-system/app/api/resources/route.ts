import { ResourceType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logActivity } from '@/lib/activity';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(ResourceType),
  location: z.string().min(2),
  capacity: z.number().int().positive(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
});

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Browse resources with filters
 */
export async function GET(request: Request) {
  const auth = await requireAuth([Role.ADMIN, Role.CUSTOMER]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as ResourceType | null;
  const location = searchParams.get('location');
  const minCapacity = searchParams.get('minCapacity');

  const resources = await prisma.resource.findMany({
    where: {
      type: type ?? undefined,
      location: location ? { contains: location } : undefined,
      capacity: minCapacity ? { gte: Number(minCapacity) } : undefined
    },
    include: {
      images: true,
      reviews: true,
      owner: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(resources);
}

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create resource (admin)
 */
export async function POST(request: Request) {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const resource = await prisma.resource.create({
    data: {
      ...parsed.data,
      ownerId: auth.user.id
    }
  });

  await logActivity('CREATE_RESOURCE', 'RESOURCE', resource.id, auth.user.id);

  return NextResponse.json(resource, { status: 201 });
}
