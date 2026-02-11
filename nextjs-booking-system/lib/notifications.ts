import { NotificationChannel, NotificationType } from '@prisma/client';

import { prisma } from './prisma';

export async function queueEmailNotification(
  userId: string,
  type: NotificationType,
  subject: string,
  message: string
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      subject,
      message,
      channel: NotificationChannel.EMAIL,
      sentAt: new Date()
    }
  });
}
