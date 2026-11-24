import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessModule } from '@/lib/permissions';
import { QuestionBankClient } from './QuestionBankClient';

export default async function QuestionBankPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'QUESTION_BANK')) {
    redirect('/dashboard');
  }

  const [questionsData, papersData, mockTestsData, subjectsData, classesData, chaptersData] =
    await Promise.all([
      prisma.question.findMany({
        include: {
          subject: true,
          chapter: true,
          options: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.questionPaper.findMany({
        include: { subject: true, class: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mockTest.findMany({
        include: { subject: true, class: true, submissions: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.findMany({ orderBy: { name: 'asc' } }),
      prisma.class.findMany({ where: { isActive: true }, orderBy: { numericOrder: 'asc' } }),
      prisma.chapter.findMany({ orderBy: { chapterNumber: 'asc' } }),
    ]);

  return (
    <QuestionBankClient
      questions={questionsData}
      questionPapers={papersData}
      mockTests={mockTestsData}
      subjects={subjectsData}
      classes={classesData}
      chapters={chaptersData}
      userRole={user.role}
    />
  );
}
