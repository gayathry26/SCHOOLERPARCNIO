import { prisma } from './db';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface DispatchNotificationOptions {
  userId: string;
  templateKey?: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  channels?: NotificationChannel[];
  recipientContact?: string;
}

export async function sendAutomatedNotification({
  userId,
  title,
  message,
  type = 'GENERAL',
  link,
  channels = ['IN_APP'],
  recipientContact,
}: DispatchNotificationOptions) {
  try {
    // 1. In-App notification
    if (channels.includes('IN_APP')) {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
          isRead: false,
        },
      });
    }

    // 2. Multi-channel delivery logs (SMS, WhatsApp, Email)
    for (const channel of channels) {
      if (channel !== 'IN_APP' && recipientContact) {
        await prisma.notificationDeliveryLog.create({
          data: {
            userId,
            notificationType: type,
            channel,
            recipientAddress: recipientContact,
            messageBody: message,
            status: 'DELIVERED',
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Notification dispatch error:', error);
    return { success: false, error };
  }
}

export const dispatchNotification = sendAutomatedNotification;

// -------------------------------------------------------------
// AUTOMATED EVENT TRIGGERS
// -------------------------------------------------------------

export async function triggerAbsenceAlert(studentId: string, dateStr: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      parents: { include: { parent: { include: { user: true } } } },
    },
  });

  if (!student) return;

  const parentUser = student.parents[0]?.parent?.user;
  const parentPhone = student.parents[0]?.parent?.phone || student.emergencyContact;

  if (parentUser) {
    await sendAutomatedNotification({
      userId: parentUser.id,
      title: `Absence Notice: ${student.user.firstName}`,
      message: `Your child ${student.user.firstName} ${student.user.lastName} has been marked absent today (${dateStr}). Please submit medical leave via Parent Portal if unwell.`,
      type: 'ATTENDANCE',
      link: '/dashboard/parent-portal',
      channels: ['IN_APP', 'WHATSAPP', 'SMS'],
      recipientContact: parentPhone || undefined,
    });
  }
}

export async function triggerBusBoardingAlert(
  studentId: string,
  busNumber: string,
  stopName: string,
  statusOrTime?: string
) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      parents: { include: { parent: { include: { user: true } } } },
    },
  });

  if (!student) return;

  const parentUser = student.parents[0]?.parent?.user;
  const parentPhone = student.parents[0]?.parent?.phone || student.emergencyContact;
  const isDrop = statusOrTime === 'DROPPED';

  if (parentUser) {
    await sendAutomatedNotification({
      userId: parentUser.id,
      title: isDrop ? `Bus Drop-off: ${student.user.firstName}` : `Bus Boarded: ${student.user.firstName}`,
      message: `${student.user.firstName} ${isDrop ? 'safely dropped off at' : 'boarded School Bus #' + busNumber + ' at'} ${stopName}.`,
      type: 'TRANSPORT',
      link: '/dashboard/transport',
      channels: ['IN_APP', 'WHATSAPP'],
      recipientContact: parentPhone || undefined,
    });
  }
}
