import React from 'react';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import QRCode from 'qrcode';
import { StudentProfileClient } from './StudentProfileClient';

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { id } = await params;

  if (user.role === 'STUDENT' && user.studentProfileId !== id) {
    redirect('/dashboard');
  }
  if (!canAccessModule(user.role, 'STUDENTS')) {
    redirect('/dashboard');
  }

  const [student, upcomingExams] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: {
          include: { class: true, section: true, academicYear: true },
          orderBy: { createdAt: 'desc' },
        },
        parents: {
          include: { parent: { include: { user: true } } },
        },
        attendance: {
          take: 60,
          orderBy: { date: 'desc' },
        },
        invoices: {
          include: { payments: true },
          orderBy: { dueDate: 'desc' },
        },
        markEntries: {
          include: {
            examSchedule: {
              include: { subject: true, exam: true },
            },
          },
        },
        submissions: {
          include: { homework: { include: { subject: true } } },
          orderBy: { submittedDate: 'desc' },
        },
        transportAssign: {
          include: { route: true, stop: true },
        },
        libraryIssues: {
          include: { book: true },
          orderBy: { issueDate: 'desc' },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
        },
        healthProfile: true,
        clinicVisits: {
          orderBy: { visitDate: 'desc' },
        },
        achievements: {
          orderBy: { achievementDate: 'desc' },
        },
        authorizedPickups: true,
        concessions: true,
        digitalConsents: true,
      },
    }),
    prisma.examSchedule.findMany({
      where: {
        examDate: { gte: new Date() },
      },
      include: {
        exam: true,
        subject: true,
      },
      orderBy: { examDate: 'asc' },
      take: 5,
    }),
  ]);

  if (!student) {
    notFound();
  }

  // Generate dynamic QR code verification payload
  const currentEnrollment =
    student.enrollments.find((e) => e.academicYear?.isCurrent) || student.enrollments[0];

  const verificationPayload = JSON.stringify({
    institution: 'EDVONEST ACADEMY',
    studentId: student.id,
    admissionNumber: student.admissionNumber,
    name: `${student.user.firstName} ${student.user.lastName}`,
    class: currentEnrollment?.class?.name,
    section: currentEnrollment?.section?.name,
    emergencyContact: student.emergencyContact,
    bloodGroup: student.bloodGroup || student.healthProfile?.bloodGroup || 'O+',
    verifiedAt: new Date().toISOString(),
  });

  const qrDataUrl = await QRCode.toDataURL(verificationPayload, {
    width: 200,
    margin: 1,
    color: {
      dark: '#086A92',
      light: '#ffffff',
    },
  });

  return (
    <StudentProfileClient
      student={student}
      qrDataUrl={qrDataUrl}
      upcomingExams={upcomingExams}
      currentUser={user}
    />
  );
}
