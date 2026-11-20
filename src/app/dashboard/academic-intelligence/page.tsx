import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessModule } from '@/lib/permissions';
import { AcademicIntelligenceClient } from './AcademicIntelligenceClient';

export default async function AcademicIntelligencePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'ACADEMIC_INTELLIGENCE')) {
    redirect('/dashboard');
  }

  const [studentsData, subjectsData, alertsData, classesData, chaptersData] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
        markEntries: {
          include: {
            examSchedule: {
              include: { subject: true, exam: true },
            },
          },
        },
        attendance: { take: 30, orderBy: { date: 'desc' } },
        academicAlerts: { where: { status: 'OPEN' } },
      },
      take: 50,
    }),
    prisma.subject.findMany({
      include: { class: true, chapters: true },
      orderBy: { name: 'asc' },
    }),
    prisma.academicAlert.findMany({
      include: {
        student: { include: { user: true, enrollments: { include: { class: true, section: true } } } },
      },
      orderBy: { detectedDate: 'desc' },
    }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.chapter.findMany({
      include: { subject: true },
      orderBy: { chapterNumber: 'asc' },
    }),
  ]);

  return (
    <AcademicIntelligenceClient
      students={studentsData}
      subjects={subjectsData}
      alerts={alertsData}
      classes={classesData}
      chapters={chaptersData}
      userRole={user.role}
    />
  );
}
