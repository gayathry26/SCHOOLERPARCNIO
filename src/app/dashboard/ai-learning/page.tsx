import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessModule } from '@/lib/permissions';
import { AiLearningClient } from './AiLearningClient';

export default async function AiLearningPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'AI_LEARNING')) {
    redirect('/dashboard');
  }

  // Resolve target student
  let studentId = user.studentProfileId;
  if (!studentId) {
    const firstStudent = await prisma.studentProfile.findFirst({
      where: { isArchived: false },
    });
    studentId = firstStudent?.id;
  }

  const [learningPaths, revisionSchedules, questions, subjects, studentProfile] = await Promise.all([
    prisma.learningPath.findMany({
      where: studentId ? { studentId } : undefined,
      include: { subject: true },
    }),
    prisma.revisionSchedule.findMany({
      where: studentId ? { studentId } : undefined,
      include: { subject: true },
      orderBy: { revisionDate: 'asc' },
    }),
    prisma.question.findMany({
      where: { isApproved: true },
      include: { options: true, subject: true, chapter: true },
      take: 15,
    }),
    prisma.subject.findMany({
      include: { chapters: true },
    }),
    studentId
      ? prisma.studentProfile.findUnique({
          where: { id: studentId },
          include: { user: true, enrollments: { include: { class: true, section: true } } },
        })
      : null,
  ]);

  return (
    <AiLearningClient
      learningPaths={learningPaths}
      revisionSchedules={revisionSchedules}
      practiceQuestions={questions}
      subjects={subjects}
      student={studentProfile}
      userRole={user.role}
    />
  );
}
