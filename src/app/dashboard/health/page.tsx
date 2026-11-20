import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { HealthClient } from './HealthClient';

export default async function HealthPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'HEALTH_CLINIC')) redirect('/dashboard');

  const [healthProfiles, clinicVisits, checkupSchedules, students] = await Promise.all([
    prisma.studentHealthProfile.findMany({
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: { class: true, section: true },
            },
          },
        },
      },
    }),
    prisma.clinicVisit.findMany({
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: { class: true, section: true },
            },
          },
        },
      },
      orderBy: { visitDate: 'desc' },
      take: 50,
    }),
    prisma.healthCheckupSchedule.findMany({
      orderBy: { scheduledDate: 'asc' },
    }),
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: {
          include: { class: true, section: true },
        },
      },
      take: 100,
    }),
  ]);

  return (
    <HealthClient
      healthProfiles={healthProfiles}
      clinicVisits={clinicVisits}
      checkupSchedules={checkupSchedules}
      students={students}
      userRole={user.role}
    />
  );
}
