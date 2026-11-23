import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { HostelClient } from './HostelClient';

export default async function HostelPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'HOSTEL')) redirect('/dashboard');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [buildings, allocations, attendances, outpasses, students] = await Promise.all([
    prisma.hostelBuilding.findMany({
      where: { isActive: true },
      include: {
        rooms: {
          orderBy: { roomNumber: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.hostelBedAllocation.findMany({
      where: { status: 'ACTIVE' },
      include: {
        room: { include: { building: true } },
        student: {
          include: {
            user: true,
            enrollments: {
              where: { academicYear: { isCurrent: true } },
              include: { class: true, section: true },
            },
          },
        },
      },
      orderBy: { allocatedDate: 'desc' },
    }),
    prisma.hostelAttendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        student: { include: { user: true } },
      },
    }),
    prisma.hostelOutpass.findMany({
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: { academicYear: { isCurrent: true } },
              include: { class: true, section: true },
            },
          },
        },
      },
      orderBy: { departureTime: 'desc' },
      take: 50,
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
      },
      orderBy: { admissionNumber: 'asc' },
    }),
  ]);

  const sanitizedStudents = students.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    name: `${s.user.firstName} ${s.user.lastName}`,
    className: s.enrollments[0]?.class?.name || 'Class 10',
    sectionName: s.enrollments[0]?.section?.name || 'A',
  }));

  return (
    <HostelClient
      initialBuildings={JSON.parse(JSON.stringify(buildings))}
      initialAllocations={JSON.parse(JSON.stringify(allocations))}
      initialAttendances={JSON.parse(JSON.stringify(attendances))}
      initialOutpasses={JSON.parse(JSON.stringify(outpasses))}
      students={sanitizedStudents}
      userRole={user.role}
    />
  );
}
