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
      where: { isActive: true },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, section: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        parents: { include: { parent: { include: { user: true } } } },
      },
      orderBy: { rollNumber: 'asc' },
    }),
  ]);

  const classes = classesData.map((c) => ({
    id: c.id,
    name: c.name,
    numericOrder: c.numericOrder,
    stream: c.stream,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name, capacity: s.capacity })),
  }));

  const initialStudents = studentsData.map((s) => {
    const enrollment = s.enrollments[0];
    return {
      id: s.id,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber || enrollment?.rollNumber || '-',
      name: `${s.user.firstName} ${s.user.lastName}`,
      email: s.user.email,
      parentPhone: s.parents[0]?.parent?.phone,
      emergencyContact: s.emergencyContact,
      classId: enrollment?.classId || null,
      sectionId: enrollment?.sectionId || null,
      className: enrollment?.class?.name || 'Unassigned',
      sectionName: enrollment?.section?.name || 'Unassigned',
    };
  });

  return (
    <AttendanceClient
      classes={classes}
      initialStudents={initialStudents}
      userRole={user.role}
    />
  );
}
