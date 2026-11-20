import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OnboardingClient } from './OnboardingClient';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
  if (!AUTHORIZED_ROLES.includes(user.role)) {
    redirect('/dashboard');
  }

  const [
    school,
    academicYears,
    classes,
    subjects,
    teachers,
    students,
    feeCategories,
    feeStructures,
    timetableCount,
  ] = await Promise.all([
    prisma.school.findFirst(),
    prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.subject.findMany({
      include: { class: true },
      orderBy: { name: 'asc' },
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
      take: 50,
    }),
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: { include: { class: true, section: true } },
      },
      take: 50,
    }),
    prisma.feeCategory.findMany(),
    prisma.feeStructure.findMany({
      include: { items: { include: { category: true } } },
    }),
    prisma.timetableEntry.count(),
  ]);

  return (
    <OnboardingClient
      initialSchool={school}
      initialAcademicYears={academicYears}
      initialClasses={classes}
      initialSubjects={subjects}
      initialTeachers={teachers}
      initialStudents={students}
      initialFeeCategories={feeCategories}
      initialFeeStructures={feeStructures}
      initialTimetableCount={timetableCount}
      currentUser={user}
    />
  );
}
