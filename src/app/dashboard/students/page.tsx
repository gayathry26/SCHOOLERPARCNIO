import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { StudentsClient } from './StudentsClient';

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'STUDENTS')) redirect('/dashboard');

  const [studentsData, classesData, academicYears] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
        parents: { include: { parent: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    }),
  ]);

  const initialStudents = studentsData.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    rollNumber: s.rollNumber || s.enrollments[0]?.rollNumber || '-',
    name: `${s.user.firstName} ${s.user.lastName}`,
    email: s.user.email,
    gender: s.gender,
    bloodGroup: s.bloodGroup || '-',
    className: s.enrollments[0]?.class?.name || 'Unassigned',
    sectionName: s.enrollments[0]?.section?.name || '-',
    classId: s.enrollments[0]?.classId,
    sectionId: s.enrollments[0]?.sectionId,
    parentName: s.parents[0]?.parent?.user
      ? `${s.parents[0].parent.user.firstName} ${s.parents[0].parent.user.lastName}`
      : 'Guardian On File',
    parentPhone: s.parents[0]?.parent?.phone || s.emergencyContact || '',
    house: s.house || 'General',
    isArchived: s.isArchived,
  }));

  const classes = classesData.map((c) => ({
    id: c.id,
    name: c.name,
    sections: c.sections.map((sec) => ({ id: sec.id, name: sec.name })),
  }));

  return (
    <StudentsClient
      initialStudents={initialStudents}
      classes={classes}
      academicYears={academicYears.map((ay) => ({
        id: ay.id,
        name: ay.name,
        isCurrent: ay.isCurrent,
      }))}
    />
  );
}
