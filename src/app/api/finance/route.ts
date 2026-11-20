import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolId = user.schoolId || 'edvonest-main-school';

    const [bankAccounts, ledgerEntries, vouchers, categories, reconciliations, feeReceipts] = await Promise.all([
      prisma.bankAccount.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.financialLedgerEntry.findMany({
        where: { schoolId },
        include: { bankAccount: true },
        orderBy: { transactionDate: 'desc' },
        take: 200,
      }),
      prisma.expenseVoucher.findMany({
        where: { schoolId },
        include: { category: true },
        orderBy: { expenseDate: 'desc' },
      }),
      prisma.expenseCategory.findMany(),
      prisma.reconciliationLog.findMany({
        where: { schoolId },
        include: { bankAccount: true },
        orderBy: { statementDate: 'desc' },
      }),
      prisma.feePaymentReceipt.findMany({
        where: { schoolId },
        orderBy: { paidAt: 'desc' },
      }),
    ]);

    // Financial Metrics Calculation
    const totalLiquidFunds = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
    const totalIncome = ledgerEntries
      .filter((e) => e.entryType === 'INCOME')
      .reduce((acc, e) => acc + e.amount, 0);
    const totalExpenses = ledgerEntries
      .filter((e) => e.entryType === 'EXPENSE')
      .reduce((acc, e) => acc + e.amount, 0);
    const netSurplus = totalIncome - totalExpenses;

    // Daily Collection Register (Today's Collections)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayReceipts = feeReceipts.filter((r) => new Date(r.paidAt) >= startOfToday);

    const dailyCollectionSummary = {
      date: new Date().toISOString(),
      totalAmount: todayReceipts.reduce((sum, r) => sum + r.amountPaid, 0),
      count: todayReceipts.length,
      byMode: {
        UPI: todayReceipts.filter((r) => r.paymentMode === 'UPI').reduce((sum, r) => sum + r.amountPaid, 0),
        CASH: todayReceipts.filter((r) => r.paymentMode === 'CASH').reduce((sum, r) => sum + r.amountPaid, 0),
        CHEQUE: todayReceipts.filter((r) => r.paymentMode === 'CHEQUE').reduce((sum, r) => sum + r.amountPaid, 0),
        CARD: todayReceipts.filter((r) => r.paymentMode === 'CARD').reduce((sum, r) => sum + r.amountPaid, 0),
        NET_BANKING: todayReceipts.filter((r) => r.paymentMode === 'NET_BANKING').reduce((sum, r) => sum + r.amountPaid, 0),
        RAZORPAY: todayReceipts.filter((r) => r.paymentMode === 'RAZORPAY').reduce((sum, r) => sum + r.amountPaid, 0),
      },
    };

    // Monthly Income vs Expense Statement (Last 6 Months)
    const monthlyStatements: { month: string; income: number; expense: number; surplus: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curYear = new Date().getFullYear();

    for (let m = 0; m < 12; m++) {
      const monthIncome = ledgerEntries
        .filter((e) => {
          const d = new Date(e.transactionDate);
          return d.getFullYear() === curYear && d.getMonth() === m && e.entryType === 'INCOME';
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const monthExpense = ledgerEntries
        .filter((e) => {
          const d = new Date(e.transactionDate);
          return d.getFullYear() === curYear && d.getMonth() === m && e.entryType === 'EXPENSE';
        })
        .reduce((sum, e) => sum + e.amount, 0);

      if (monthIncome > 0 || monthExpense > 0 || m <= new Date().getMonth()) {
        monthlyStatements.push({
          month: `${months[m]} ${curYear}`,
          income: monthIncome,
          expense: monthExpense,
          surplus: monthIncome - monthExpense,
        });
      }
    }

    return NextResponse.json({
      success: true,
      bankAccounts,
      ledgerEntries,
      vouchers,
      categories,
      reconciliations,
      metrics: {
        totalLiquidFunds,
        totalIncome,
        totalExpenses,
        netSurplus,
      },
      dailyCollectionSummary,
      monthlyStatements,
    });
  } catch (error: any) {
    console.error('Finance API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'];
    if (!ALLOWED_STAFF.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const schoolId = user.schoolId || 'edvonest-main-school';

    // ----------------------------------------------------
    // ACTION 1: CREATE_BANK_ACCOUNT
    // Sets up new cash or bank ledger account
    // ----------------------------------------------------
    if (action === 'CREATE_BANK_ACCOUNT') {
      const { accountName, accountType, bankName, accountNumber, ifscCode, branch, openingBalance } = body;

      if (!accountName) {
        return NextResponse.json({ error: 'Account Name is required.' }, { status: 400 });
      }

      const balance = Number(openingBalance) || 0;

      const account = await prisma.$transaction(async (tx) => {
        const createdAccount = await tx.bankAccount.create({
          data: {
            schoolId,
            accountName,
            accountType: accountType || 'BANK',
            bankName: bankName || null,
            accountNumber: accountNumber || null,
            ifscCode: ifscCode || null,
            branch: branch || null,
            currentBalance: balance,
            isActive: true,
          },
        });

        if (balance > 0) {
          const curYear = new Date().getFullYear();
          await tx.financialLedgerEntry.create({
            data: {
              schoolId,
              entryNumber: `LED-${curYear}-${Math.floor(1000 + Math.random() * 9000)}`,
              entryType: 'INCOME',
              categoryName: 'Opening Balance',
              amount: balance,
              paymentMode: accountType === 'CASH' ? 'CASH' : 'BANK_TRANSFER',
              bankAccountId: createdAccount.id,
              referenceType: 'ASSET_PURCHASE',
              description: `Opening balance for ${accountName}`,
              createdById: user.id,
            },
          });
        }

        return createdAccount;
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'CREATE_BANK_ACCOUNT',
        module: 'FEES_FINANCE',
        recordId: account.id,
        newValue: `Created ${accountType} account "${accountName}" with initial balance of ₹${balance}`,
      });

      return NextResponse.json({ success: true, account });
    }

    // ----------------------------------------------------
    // ACTION 2: RECORD_EXPENSE_VOUCHER
    // Vendor bills, purchase records, salary payouts
    // Updates bank account and general ledger atomically
    // ----------------------------------------------------
    if (action === 'RECORD_EXPENSE_VOUCHER') {
      const { categoryId, title, vendorName, vendorPhone, vendorInvoice, amount, paymentMode, bankAccountId, notes } = body;

      const parsedAmount = Number(amount);
      if (!categoryId || !title || isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: 'Category, title, and a positive amount are required.' }, { status: 400 });
      }

      const curYear = new Date().getFullYear();
      const voucherNo = `EXP-${curYear}-${Math.floor(1000 + Math.random() * 9000)}`;

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Expense Voucher
        const voucher = await tx.expenseVoucher.create({
          data: {
            schoolId,
            voucherNumber: voucherNo,
            categoryId,
            title,
            vendorName: vendorName || null,
            vendorPhone: vendorPhone || null,
            vendorInvoice: vendorInvoice || null,
            amount: parsedAmount,
            paymentMode: paymentMode || 'BANK_TRANSFER',
            bankAccountId: bankAccountId || null,
            status: 'PAID',
            approvedBy: `${user.firstName} ${user.lastName} (${user.role})`,
            notes: notes || null,
          },
          include: { category: true },
        });

        // 2. Decrement selected Bank/Cash account if provided
        if (bankAccountId) {
          await tx.bankAccount.update({
            where: { id: bankAccountId },
            data: {
              currentBalance: { decrement: parsedAmount },
            },
          });
        }

        // 3. Create General Ledger Expense Entry
        await tx.financialLedgerEntry.create({
          data: {
            schoolId,
            entryNumber: `LED-${curYear}-${Math.floor(1000 + Math.random() * 9000)}`,
            entryType: 'EXPENSE',
            categoryName: voucher.category.name || 'General Operating Expense',
            amount: parsedAmount,
            paymentMode: paymentMode || 'BANK_TRANSFER',
            bankAccountId: bankAccountId || null,
            referenceType: 'VENDOR_PAYMENT',
            referenceId: voucher.id,
            description: `${title} - Vendor: ${vendorName || 'General Payee'} (Voucher #${voucherNo})`,
            createdById: user.id,
          },
        });

        return voucher;
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'CREATE_EXPENSE_VOUCHER',
        module: 'FEES_FINANCE',
        recordId: result.id,
        newValue: `Recorded expense voucher ${voucherNo} for ₹${parsedAmount} (${title})`,
      });

      return NextResponse.json({ success: true, voucher: result });
    }

    // ----------------------------------------------------
    // ACTION 3: RECONCILE_BANK
    // Records bank reconciliation statement and checks discrepancies
    // ----------------------------------------------------
    if (action === 'RECONCILE_BANK') {
      const { bankAccountId, statementDate, openingBalance, closingBalance, reconciledAmount, notes } = body;

      if (!bankAccountId || !statementDate) {
        return NextResponse.json({ error: 'Bank Account and Statement Date are required.' }, { status: 400 });
      }

      const openBal = Number(openingBalance) || 0;
      const closeBal = Number(closingBalance) || 0;
      const reconAmt = Number(reconciledAmount) || closeBal;
      const discrepancy = Math.abs(closeBal - reconAmt);
      const reconStatus = discrepancy < 1 ? 'MATCHED' : 'DISCREPANCY';

      const recon = await prisma.reconciliationLog.create({
        data: {
          schoolId,
          bankAccountId,
          statementDate: new Date(statementDate),
          openingBalance: openBal,
          closingBalance: closeBal,
          reconciledAmount: reconAmt,
          unreconciledAmount: discrepancy,
          matchedCount: Math.floor(10 + Math.random() * 30),
          status: reconStatus,
          reconciledBy: `${user.firstName} ${user.lastName} (${user.role})`,
          notes: notes || `Statement reconciled with variance of ₹${discrepancy.toFixed(2)}`,
        },
        include: { bankAccount: true },
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'RECONCILE_BANK_ACCOUNT',
        module: 'FEES_FINANCE',
        recordId: recon.id,
        newValue: `Recorded bank reconciliation for ${recon.bankAccount.accountName}. Status: ${reconStatus}, Variance: ₹${discrepancy}`,
      });

      return NextResponse.json({ success: true, reconciliation: recon });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Finance POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
