import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return NextResponse.json({
    id: auth.user.id,
    name: auth.user.name,
    email: auth.user.email,
    role: auth.user.role
  });
}
