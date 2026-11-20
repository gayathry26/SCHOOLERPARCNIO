import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { MultiCampusClient } from './MultiCampusClient';

export default async function MultiCampusPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'MULTI_CAMPUS')) {
    redirect('/dashboard');
  }

  const [branches, totalStudents, totalTeachers] = await Promise.all([
    prisma.campusBranch.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
  ]);

  return (
    <MultiCampusClient
      branches={branches}
      totalStudents={totalStudents}
      totalTeachers={totalTeachers}
      userRole={user.role}
    />
  );
}
