import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessModule } from '@/lib/permissions';
import { CampusSafetyClient } from './CampusSafetyClient';

export default async function CampusSafetyPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!canAccessModule(user.role, 'CAMPUS_SAFETY')) {
    redirect('/dashboard');
  }

  const [gateLogs, visitorPasses, pickups, incidents, students] = await Promise.all([
    prisma.gateLog.findMany({
      take: 40,
      orderBy: { entryTime: 'desc' },
      include: { user: true },
    }),
    prisma.visitorPass.findMany({
      orderBy: { checkInTime: 'desc' },
    }),
    prisma.authorizedPickup.findMany({
      include: { student: { include: { user: true, enrollments: { include: { class: true, section: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.safetyIncident.findMany({
      include: { reportedBy: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: { user: true, enrollments: { include: { class: true, section: true } } },
      take: 30,
    }),
  ]);

  return (
    <CampusSafetyClient
      gateLogs={gateLogs}
      visitorPasses={visitorPasses}
      pickups={pickups}
      incidents={incidents}
      students={students}
      userRole={user.role}
    />
  );
}
