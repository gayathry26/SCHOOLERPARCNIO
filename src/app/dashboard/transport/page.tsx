import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { TransportClient } from './TransportClient';

export default async function TransportPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'TRANSPORT')) redirect('/dashboard');

  const [vehiclesData, routesData, assignmentsData, activeTrips, maintenanceLogs] = await Promise.all([
    prisma.vehicle.findMany({
      include: {
        driverStaff: { include: { user: true } },
        maintenanceRecords: { orderBy: { scheduledDate: 'desc' }, take: 5 },
      },
    }),
    prisma.route.findMany({
      include: {
        vehicle: true,
        stops: { orderBy: { stopOrder: 'asc' } },
      },
    }),
    prisma.studentTransportAssignment.findMany({
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: {
                class: true,
                section: true,
              },
            },
          },
        },
        route: true,
        stop: true,
      },
    }),
    prisma.busTripLog.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    }),
    prisma.vehicleMaintenance.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { scheduledDate: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <TransportClient
      vehicles={vehiclesData}
      routes={routesData}
      assignments={assignmentsData}
      activeTrips={activeTrips}
      maintenanceLogs={maintenanceLogs}
      userRole={user.role}
    />
  );
}
