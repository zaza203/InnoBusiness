import crypto from 'node:crypto';

import { Role, type User } from '@prisma/client';
import { headers } from 'next/headers';

import { prisma } from './prisma';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export function hashPassword(rawPassword: string) {
  return crypto.createHash('sha256').update(rawPassword).digest('hex');
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = headers().get('x-session-token');
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireAuth(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: Response.json({ error: 'Authentication required.' }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { error: Response.json({ error: 'Insufficient permissions.' }, { status: 403 }) };
  }
  return { user };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}
