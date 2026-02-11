import { prisma } from './prisma';

export async function logActivity(
  action: string,
  entity: string,
  entityId: string,
  actorUserId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.activityLog.create({
    data: {
      action,
      entity,
      entityId,
      actorUserId,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    }
  });
}
