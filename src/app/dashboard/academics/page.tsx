import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { AcademicsClient } from './AcademicsClient';

export default async function AcademicsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'ACADEMICS')) redirect('/dashboard');

  const [yearsData, classesData, subjectsData, materialsData] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.class.findMany({
      include: {
        sections: {
          include: { classTeacher: { include: { user: true } } },
        },
      },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.subject.findMany({
      include: {
        class: true,
        teacherSubjects: { include: { teacher: { include: { user: true } } } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.studyMaterial.findMany({
      include: { subject: true },
    }),
  ]);

  return (
    <AcademicsClient
      academicYears={yearsData}
      classes={classesData}
      subjects={subjectsData}
      studyMaterials={materialsData}
    />
  );
}
