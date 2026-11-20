import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { ParentPortalClient } from './ParentPortalClient';

export default async function ParentPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'PARENT_PORTAL')) redirect('/dashboard');

  let parentProfile = await prisma.parentProfile.findFirst({
    where: { userId: user.id },
    include: {
      user: true,
      students: {
        include: {
          student: {
            include: {
              user: true,
              enrollments: { include: { class: true, section: true } },
            },
          },
        },
      },
    },
  });

  if (!parentProfile) {
    parentProfile = await prisma.parentProfile.findFirst({
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true,
                enrollments: { include: { class: true, section: true } },
              },
            },
          },
        },
      },
    });
  }

  const primaryStudent = parentProfile?.students?.[0]?.student;

  const [ptmBookings, digitalConsents, homeworkList, teachers, invoices] = await Promise.all([
    parentProfile
      ? prisma.ptmBooking.findMany({
          where: { parentId: parentProfile.id },
          include: { teacher: { include: { user: true } } },
          orderBy: { scheduledDate: 'asc' },
        })
      : [],
    parentProfile
      ? prisma.digitalConsent.findMany({
          where: { parentId: parentProfile.id },
          include: { student: { include: { user: true } } },
          orderBy: { deadline: 'asc' },
        })
      : [],
    prisma.homework.findMany({
      take: 6,
      orderBy: { dueDate: 'desc' },
      include: { subject: true },
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
      take: 20,
    }),
    primaryStudent
      ? prisma.studentFeeInvoice.findMany({
          where: { studentId: primaryStudent.id },
          include: { payments: true },
          take: 5,
          orderBy: { dueDate: 'desc' },
        })
      : [],
  ]);

  return (
    <ParentPortalClient
      parentProfile={parentProfile}
      primaryStudent={primaryStudent}
      ptmBookings={ptmBookings}
      digitalConsents={digitalConsents}
      homeworkList={homeworkList}
      teachers={teachers}
      invoices={invoices}
      userRole={user.role}
    />
  );
}
