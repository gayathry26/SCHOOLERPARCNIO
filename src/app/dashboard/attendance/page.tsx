import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { AttendanceClient } from './AttendanceClient';

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'ATTENDANCE')) redirect('/dashboard');

  const [classesData, studentsData] = await Promise.all([
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
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
      orderBy: { rollNumber: 'asc' },
    }),
  ]);

  const classes = classesData.map((c) => ({
    id: c.id,
    name: c.name,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name })),
  }));

  const initialStudents = studentsData.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    rollNumber: s.rollNumber || s.enrollments[0]?.rollNumber || '-',
    name: `${s.user.firstName} ${s.user.lastName}`,
    email: s.user.email,
    parentPhone: s.parents[0]?.parent?.phone,
    emergencyContact: s.emergencyContact,
  }));

  return <AttendanceClient classes={classes} initialStudents={initialStudents} />;
}
