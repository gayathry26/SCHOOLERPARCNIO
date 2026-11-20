import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { HomeworkClient } from './HomeworkClient';

export default async function HomeworkPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'ACADEMICS')) redirect('/dashboard');

  const [homeworksData, classesData, subjectsData] = await Promise.all([
    prisma.homework.findMany({
      include: {
        class: true,
        section: true,
        subject: true,
        submissions: true,
      },
      orderBy: { dueDate: 'desc' },
    }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <HomeworkClient
      homeworks={homeworksData}
      classes={classesData}
      subjects={subjectsData}
      userRole={user.role}
    />
  );
}
