import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessModule } from '@/lib/permissions';
import { LessonPlansClient } from './LessonPlansClient';

export default async function LessonPlansPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'LESSON_PLANS')) {
    redirect('/dashboard');
  }

  const [lessonPlans, classes, subjects, chapters, teachers] = await Promise.all([
    prisma.lessonPlan.findMany({
      include: {
        teacher: { include: { user: true } },
        class: true,
        section: true,
        subject: true,
        chapter: true,
      },
      orderBy: { scheduledDate: 'desc' },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      include: { sections: { where: { isActive: true } } },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.subject.findMany({
      include: { chapters: true },
      orderBy: { name: 'asc' },
    }),
    prisma.chapter.findMany({
      include: { subject: true },
      orderBy: { chapterNumber: 'asc' },
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
    }),
  ]);

  return (
    <LessonPlansClient
      lessonPlans={lessonPlans}
      classes={classes}
      subjects={subjects}
      chapters={chapters}
      teachers={teachers}
      userRole={user.role}
      currentUserId={user.id}
    />
  );
}
