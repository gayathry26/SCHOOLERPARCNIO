import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { LifecycleClient } from './LifecycleClient';

export default async function LifecyclePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'LIFECYCLE')) redirect('/dashboard');

  const academicYears = await prisma.academicYear.findMany({
    include: {
      _count: { select: { enrollments: true, classes: true, exams: true } },
      closingLogs: { orderBy: { closedAt: 'desc' }, take: 1 },
    },
    orderBy: { startDate: 'desc' },
  });

  const activeYear = academicYears.find((y) => y.isCurrent) || academicYears[0];
  const activeYearId = activeYear?.id;

  const [
    classesData,
    teachersData,
    allocationsData,
    enrollmentsData,
    applicationsData,
    alumniData,
    closingLogsData,
    promotionsData,
    invoicesData,
    examsData,
  ] = await Promise.all([
    prisma.class.findMany({
      include: {
        sections: {
          include: {
            classTeacher: { include: { user: true } },
            _count: { select: { enrollments: true } },
          },
        },
        subjects: true,
      },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.teacherProfile.findMany({
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    }),
    activeYearId
      ? prisma.teacherAllocation.findMany({
          where: { academicYearId: activeYearId },
          include: {
            teacher: { include: { user: true } },
            class: true,
            section: true,
            subject: true,
          },
        })
      : [],
    activeYearId
      ? prisma.studentEnrollment.findMany({
          where: { academicYearId: activeYearId },
          include: {
            student: {
              include: {
                user: true,
                parents: { include: { parent: { include: { user: true } } } },
                markEntries: {
                  where: { examSchedule: { exam: { academicYearId: activeYearId } } },
                  include: { examSchedule: { include: { exam: true, subject: true } } },
                },
                attendance: {
                  where: { academicYearId: activeYearId },
                },
                invoices: true,
                alumniRecord: true,
              },
            },
            class: true,
            section: true,
          },
          orderBy: [{ class: { numericOrder: 'asc' } }, { rollNumber: 'asc' }],
        })
      : [],
    prisma.admissionApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.alumniRecord.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { graduationYear: 'desc' },
    }),
    prisma.yearEndClosingLog.findMany({
      include: { academicYear: true },
      orderBy: { closedAt: 'desc' },
    }),
    prisma.studentPromotionLog.findMany({
      include: {
        student: { include: { user: true } },
        fromYear: true,
        toYear: true,
        fromClass: true,
        toClass: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.studentFeeInvoice.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      include: { student: { include: { user: true } } },
    }),
    activeYearId
      ? prisma.examSchedule.findMany({
          where: { exam: { academicYearId: activeYearId } },
          include: { exam: true, subject: true },
        })
      : [],
  ]);

  return (
    <LifecycleClient
      initialYears={academicYears}
      activeYear={activeYear}
      classes={classesData}
      teachers={teachersData}
      initialAllocations={allocationsData}
      initialEnrollments={enrollmentsData}
      applications={applicationsData}
      initialAlumni={alumniData}
      closingLogs={closingLogsData}
      initialPromotions={promotionsData}
      unpaidInvoices={invoicesData}
      examSchedules={examsData}
      userRole={user.role}
    />
  );
}
