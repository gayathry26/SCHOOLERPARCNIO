import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { ExamsClient } from './ExamsClient';

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'EXAMINATIONS')) redirect('/dashboard');

  const [examsData, studentsData, subjectsData] = await Promise.all([
    prisma.exam.findMany({
      include: {
        schedules: {
          include: {
            subject: true,
            markEntries: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
        },
      },
      orderBy: { rollNumber: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const students = studentsData.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    rollNumber: s.rollNumber || '01',
    name: `${s.user.firstName} ${s.user.lastName}`,
    email: s.user.email,
  }));

  return <ExamsClient exams={examsData} userRole={user.role} students={students} subjects={subjectsData} />;
}
