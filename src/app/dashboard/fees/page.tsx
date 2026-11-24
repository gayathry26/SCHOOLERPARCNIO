import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { FeesClient } from './FeesClient';

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'FEES_FINANCE')) redirect('/dashboard');

  const schoolId = user.schoolId || 'edvonest-main-school';

  const invoiceWhere: any = { schoolId };
  if (user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findFirst({ where: { userId: user.id } });
    if (studentProfile) invoiceWhere.studentId = studentProfile.id;
  } else if (user.role === 'PARENT') {
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { userId: user.id },
      include: { students: true },
    });
    const studentIds = parentProfile?.students.map((s) => s.studentId) || [];
    invoiceWhere.studentId = { in: studentIds };
  }

  const [
    invoicesData,
    structuresData,
    receiptsData,
    concessionsData,
    bankAccountsData,
    categoriesData,
    classesData,
    studentsData,
    schoolData,
  ] = await Promise.all([
    prisma.studentFeeInvoice.findMany({
      where: invoiceWhere,
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: { status: 'ACTIVE' },
              include: { class: true, section: true },
              take: 1,
            },
          },
        },
        payments: {
          include: { refunds: true, bankAccount: true },
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feeStructure.findMany({
      where: { schoolId },
      include: {
        items: { include: { category: true } },
        installments: { orderBy: { order: 'asc' } },
        class: true,
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feePaymentReceipt.findMany({
      where: { schoolId },
      include: {
        invoice: {
          include: {
            student: {
              include: {
                user: true,
                enrollments: {
                  where: { status: 'ACTIVE' },
                  include: { class: true, section: true },
                  take: 1,
                },
              },
            },
          },
        },
        refunds: true,
        bankAccount: true,
      },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.studentFeeConcession.findMany({
      where: { schoolId },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: { status: 'ACTIVE' },
              include: { class: true, section: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bankAccount.findMany({
      where: { schoolId },
      orderBy: { currentBalance: 'desc' },
    }),
    prisma.feeCategory.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      where: { schoolId, isActive: true },
      include: { sections: { where: { isActive: true } } },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.studentProfile.findMany({
      where: { user: { schoolId } },
      include: {
        user: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true },
          take: 1,
        },
      },
      take: 100,
    }),
    prisma.school.findUnique({
      where: { id: schoolId },
    }),
  ]);

  return (
    <FeesClient
      invoices={invoicesData}
      feeStructures={structuresData}
      receipts={receiptsData}
      concessions={concessionsData}
      bankAccounts={bankAccountsData}
      categories={categoriesData}
      classes={classesData}
      students={studentsData}
      schoolInfo={schoolData}
      userRole={user.role}
    />
  );
}
