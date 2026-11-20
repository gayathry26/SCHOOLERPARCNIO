import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'REPORTS')) redirect('/dashboard');

  const [studentsData, attendanceData, invoicesData, marksData, staffData] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
      },
    }),
    prisma.attendanceRecord.findMany({
      include: { student: { include: { user: true } } },
      take: 100,
      orderBy: { date: 'desc' },
    }),
    prisma.studentFeeInvoice.findMany({
      include: { student: { include: { user: true } } },
    }),
    prisma.examMarkEntry.findMany({
      include: {
        student: { include: { user: true } },
        examSchedule: { include: { subject: true, exam: true } },
      },
    }),
    prisma.staffProfile.findMany({
      include: { user: true, department: true },
    }),
  ]);

  return (
    <ReportsClient
      students={studentsData}
      attendance={attendanceData}
      invoices={invoicesData}
      marks={marksData}
      staff={staffData}
    />
  );
}
