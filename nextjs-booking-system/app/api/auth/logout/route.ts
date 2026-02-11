import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { destroySession } from '@/lib/auth';

export async function POST() {
  const token = headers().get('x-session-token');
  if (!token) return NextResponse.json({ ok: true });
  await destroySession(token);
  return NextResponse.json({ ok: true });
}
