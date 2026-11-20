import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { IdCardsClient } from './IdCardsClient';

export default async function IdCardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(user.role)) redirect('/dashboard');

  const [studentsData, teachersData] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
      },
      take: 24,
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
    }),
  ]);

  return <IdCardsClient students={studentsData} teachers={teachersData} />;
}
