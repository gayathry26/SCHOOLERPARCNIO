import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { CertificatesClient } from './CertificatesClient';

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'CERTIFICATES')) redirect('/dashboard');

  const [templatesData, issuedData, studentsData] = await Promise.all([
    prisma.certificateTemplate.findMany(),
    prisma.issuedCertificate.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { issueDate: 'desc' },
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true },
        },
        parents: { include: { parent: { include: { user: true } } } },
      },
    }),
  ]);

  const students = studentsData.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    name: `${s.user.firstName} ${s.user.lastName}`,
    className: s.enrollments[0]?.class?.name || 'Class 10',
    parentName: s.parents[0]?.parent?.user
      ? `${s.parents[0].parent.user.firstName} ${s.parents[0].parent.user.lastName}`
      : 'Guardian On File',
  }));

  return (
    <CertificatesClient
      templates={templatesData}
      issuedCertificates={issuedData}
      students={students}
    />
  );
}
