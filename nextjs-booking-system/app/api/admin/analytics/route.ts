import { BookingStatus, ResourceType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth([Role.ADMIN]);
  if (auth.error) return auth.error;

  const [
    totalResources,
    totalBookings,
    pendingBookings,
    approvedBookings,
    rooms,
    vehicles,
    waitingListCount,
    avgRating,
    activity
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
    prisma.booking.count({ where: { status: BookingStatus.APPROVED } }),
    prisma.resource.count({ where: { type: ResourceType.MEETING_ROOM } }),
    prisma.resource.count({ where: { type: ResourceType.VEHICLE } }),
    prisma.waitingList.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.activityLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } })
  ]);

  return NextResponse.json({
    totals: {
      totalResources,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rooms,
      vehicles,
      waitingListCount,
      averageRating: avgRating._avg.rating ?? 0
    },
    recentActivity: activity
  });
}
