import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSession, hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user || user.passwordHash !== hashPassword(parsed.data.password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const token = await createSession(user.id);
  await logActivity('LOGIN', 'USER', user.id, user.id);

  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
