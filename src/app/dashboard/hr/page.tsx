import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { HrClient } from './HrClient';

export default async function HrPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'HR_MANAGEMENT')) redirect('/dashboard');

  const [
    teachersData,
    staffData,
    leavesData,
    salarySlipsData,
    substitutesData,
    attendanceData,
    appraisalsData,
    sectionsData,
    academicYearsData,
    classesData,
    departmentsData,
    subjectsData,
  ] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: true,
        department: true,
        teacherAllocations: {
          include: {
            class: true,
            section: true,
            subject: true,
            academicYear: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        teacherSubjects: {
          include: { subject: true },
        },
        salaryHistory: {
          orderBy: { effectiveDate: 'desc' },
        },
        lifecycleLogs: {
          orderBy: { effectiveDate: 'desc' },
        },
        sections: {
          include: { class: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staffProfile.findMany({
      include: {
        user: true,
        department: true,
        salaryHistory: {
          orderBy: { effectiveDate: 'desc' },
        },
        lifecycleLogs: {
          orderBy: { effectiveDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.leaveRequest.findMany({
      include: {
        teacher: { include: { user: true } },
        staff: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staffSalarySlip.findMany({
      include: {
        teacher: { include: { user: true } },
        staff: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.substituteAssignment.findMany({
      include: {
        absentTeacher: { include: { user: true } },
        substituteTeacher: { include: { user: true } },
        section: { include: { class: true } },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.staffAttendanceRecord.findMany({
      include: {
        teacher: { include: { user: true } },
        staff: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.staffAppraisal.findMany({
      include: {
        teacher: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.section.findMany({
      include: { class: true },
      orderBy: { name: 'asc' },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    }),
    prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <HrClient
      teachers={teachersData}
      staff={staffData}
      leaves={leavesData}
      salarySlips={salarySlipsData}
      substitutes={substitutesData}
      attendanceRecords={attendanceData}
      appraisals={appraisalsData}
      sections={sectionsData}
      academicYears={academicYearsData}
      classes={classesData}
      departments={departmentsData}
      subjects={subjectsData}
      userRole={user.role}
    />
  );
}
