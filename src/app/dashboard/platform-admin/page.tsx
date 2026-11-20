import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PlatformAdminClient } from './PlatformAdminClient';

export default async function PlatformAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const [schools, plans, invoices, users] = await Promise.all([
    prisma.school.findMany({
      include: {
        _count: {
          select: {
            users: true,
            branches: true,
            academicYears: true,
            classes: true,
          },
        },
        subscriptionInvoices: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { pricePerYear: 'asc' },
    }),
    prisma.subscriptionInvoice.findMany({
      include: { school: true },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.user.findMany({
      select: { id: true, schoolId: true, role: true },
    }),
  ]);

  const enrichedSchools = schools.map((s) => {
    const schoolUsers = users.filter((u) => u.schoolId === s.id);
    const studentCount = schoolUsers.filter((u) => u.role === 'STUDENT').length;
    const staffCount = schoolUsers.filter((u) =>
      ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'PRINCIPAL', 'VICE_PRINCIPAL', 'LIBRARIAN'].includes(u.role)
    ).length;

    return {
      ...s,
      liveMetrics: {
        students: studentCount,
        staff: staffCount,
        capacityPercent: s.maxStudents > 0 ? Math.round((studentCount / s.maxStudents) * 100) : 0,
      },
    };
  });

  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
  const totalStaff = users.filter((u) =>
    ['TEACHER', 'CLASS_TEACHER', 'HR_MANAGER', 'ACCOUNTANT', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(u.role)
  ).length;

  const totalPaidRevenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <PlatformAdminClient
      initialSchools={enrichedSchools}
      plans={plans}
      initialInvoices={invoices}
      kpis={{
        totalSchools: schools.length,
        activeSchools: schools.filter((s) => s.status === 'ACTIVE').length,
        suspendedSchools: schools.filter((s) => s.status === 'SUSPENDED').length,
        totalStudents,
        totalStaff,
        totalPaidRevenue,
        systemHealth: 'OPERATIONAL',
      }}
    />
  );
}
