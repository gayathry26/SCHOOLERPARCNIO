import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CommandCentreClient } from './CommandCentreClient';

export default async function CommandCentrePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard');
  }

  const [
    totalStudents,
    totalTeachers,
    totalStaff,
    classesData,
    invoices,
    chapters,
    admissions,
    alerts,
    trips,
    incidents,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.staffProfile.count(),
    prisma.class.findMany({
      include: {
        sections: {
          include: {
            enrollments: true,
          },
        },
      },
    }),
    prisma.studentFeeInvoice.findMany({
      include: { payments: true },
    }),
    prisma.chapter.findMany(),
    prisma.admissionApplication.findMany(),
    prisma.academicAlert.findMany({
      take: 8,
      orderBy: { detectedDate: 'desc' },
      include: {
        student: {
          include: { user: true, enrollments: { include: { class: true, section: true } } },
        },
      },
    }),
    prisma.busTripLog.findMany({
      take: 10,
      orderBy: { startTime: 'desc' },
      include: { vehicle: true },
    }),
    prisma.safetyIncident.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Aggregate metrics
  const totalBilled = invoices.reduce((acc: number, i: any) => acc + (i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce(
    (acc: number, i: any) =>
      acc + (i.payments || []).reduce((pAcc: number, p: any) => pAcc + (p.amountPaid || p.amount || 0), 0),
    0
  );
  const pendingDues = Math.max(0, totalBilled - totalCollected);

  const completedChapters = chapters.filter((c: any) => c.status === 'COMPLETED').length;
  const syllabusRate = chapters.length > 0 ? Math.round((completedChapters / chapters.length) * 100) : 78;

  return (
    <CommandCentreClient
      totalStudents={totalStudents}
      totalTeachers={totalTeachers}
      totalStaff={totalStaff}
      classes={classesData}
      financials={{ totalBilled, totalCollected, pendingDues }}
      syllabusRate={syllabusRate}
      totalChapters={chapters.length}
      completedChapters={completedChapters}
      admissions={admissions}
      alerts={alerts}
      trips={trips}
      incidents={incidents}
      userRole={user.role}
    />
  );
}
