import { Role } from '@prisma/client';
import { headers } from 'next/headers';

import { prisma } from './prisma';

export async function getCurrentUser() {
  const headerStore = headers();
  const userId = headerStore.get('x-user-id');
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) };
  }
  return { user };
}
