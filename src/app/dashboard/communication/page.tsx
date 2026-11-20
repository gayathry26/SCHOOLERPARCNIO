import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { CommunicationClient } from './CommunicationClient';

export default async function CommunicationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'COMMUNICATION')) redirect('/dashboard');

  const [announcementsData, eventsData, messagesData, teachersData, parentsData] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { publishedAt: 'desc' } }),
    prisma.schoolEvent.findMany({ orderBy: { startDate: 'asc' } }),
    prisma.directMessage.findMany({
      include: { sender: true, receiver: true },
      orderBy: { sentAt: 'asc' },
    }),
    prisma.teacherProfile.findMany({ include: { user: true } }),
    prisma.parentProfile.findMany({ include: { user: true } }),
  ]);

  return (
    <CommunicationClient
      announcements={announcementsData}
      events={eventsData}
      directMessages={messagesData}
      teachers={teachersData}
      parents={parentsData}
      user={user}
    />
  );
}
