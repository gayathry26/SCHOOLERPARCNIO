import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { AdmissionsClient } from './AdmissionsClient';

export default async function AdmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'ADMISSIONS')) redirect('/dashboard');

  const applications = await prisma.admissionApplication.findMany({
    include: {
      documents: true,
      interviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <AdmissionsClient initialApplications={applications} userRole={user.role} />;
}
