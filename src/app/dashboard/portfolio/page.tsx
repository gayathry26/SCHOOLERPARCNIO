import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { PortfolioClient } from './PortfolioClient';

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'STUDENT_PORTFOLIO')) redirect('/dashboard');

  const whereClause: any = {};
  if (user.role === 'STUDENT') {
    const sp = await prisma.studentProfile.findFirst({ where: { userId: user.id } });
    if (sp) whereClause.studentId = sp.id;
  }

  const [achievements, students] = await Promise.all([
    prisma.studentAchievement.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: true,
            enrollments: { include: { class: true, section: true } },
          },
        },
      },
      orderBy: { achievementDate: 'desc' },
    }),
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: { include: { class: true, section: true } },
      },
      take: 100,
    }),
  ]);

  return (
    <PortfolioClient
      initialAchievements={achievements}
      students={students}
      userRole={user.role}
      currentUserName={`${user.firstName} ${user.lastName || ''}`.trim() || 'Staff'}
    />
  );
}
