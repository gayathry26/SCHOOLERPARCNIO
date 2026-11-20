import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { FinanceClient } from './FinanceClient';

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'FEES_FINANCE')) redirect('/dashboard');

  const schoolId = user.schoolId || 'edvonest-main-school';

  const [
    vouchersData,
    categoriesData,
    bankAccountsData,
    ledgerEntriesData,
    reconciliationsData,
    receiptsData,
    schoolData,
  ] = await Promise.all([
    prisma.expenseVoucher.findMany({
      where: { schoolId },
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.bankAccount.findMany({
      where: { schoolId },
      orderBy: { currentBalance: 'desc' },
    }),
    prisma.financialLedgerEntry.findMany({
      where: { schoolId },
      include: { bankAccount: true },
      orderBy: { transactionDate: 'desc' },
      take: 200,
    }),
    prisma.reconciliationLog.findMany({
      where: { schoolId },
      include: { bankAccount: true },
      orderBy: { statementDate: 'desc' },
    }),
    prisma.feePaymentReceipt.findMany({
      where: { schoolId },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.school.findUnique({
      where: { id: schoolId },
    }),
  ]);

  // Aggregate today's collections
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayReceipts = receiptsData.filter((r) => new Date(r.paidAt) >= startOfToday);

  const dailyCollectionSummary = {
    totalAmount: todayReceipts.reduce((sum, r) => sum + r.amountPaid, 0),
    count: todayReceipts.length,
    byMode: {
      UPI: todayReceipts.filter((r) => r.paymentMode === 'UPI').reduce((sum, r) => sum + r.amountPaid, 0),
      CASH: todayReceipts.filter((r) => r.paymentMode === 'CASH').reduce((sum, r) => sum + r.amountPaid, 0),
      CHEQUE: todayReceipts.filter((r) => r.paymentMode === 'CHEQUE').reduce((sum, r) => sum + r.amountPaid, 0),
      CARD: todayReceipts.filter((r) => r.paymentMode === 'CARD').reduce((sum, r) => sum + r.amountPaid, 0),
      NET_BANKING: todayReceipts.filter((r) => r.paymentMode === 'NET_BANKING').reduce((sum, r) => sum + r.amountPaid, 0),
    },
  };

  return (
    <FinanceClient
      vouchers={vouchersData}
      categories={categoriesData}
      bankAccounts={bankAccountsData}
      ledgerEntries={ledgerEntriesData}
      reconciliations={reconciliationsData}
      dailyCollection={dailyCollectionSummary}
      schoolInfo={schoolData}
      userRole={user.role}
    />
  );
}
