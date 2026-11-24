import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { TimetableClient } from './TimetableClient';

export default async function TimetablePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'ACADEMICS')) redirect('/dashboard');

  const [classesData, teachersData, subjectsData, timetableData] = await Promise.all([
    prisma.class.findMany({
      where: { isActive: true },
      include: { sections: { where: { isActive: true } } },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
    }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.timetableEntry.findMany({
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    }),
  ]);

  return (
    <TimetableClient
      classes={classesData}
      teachers={teachersData}
      subjects={subjectsData}
      initialEntries={timetableData}
      userRole={user.role}
    />
  );
}
