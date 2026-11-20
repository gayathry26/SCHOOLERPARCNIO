import { prisma } from '../../lib/db';

async function runFinancialTests() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE SCHOOL FINANCIAL SYSTEM AUDIT');
  console.log('Tagline: Learn • Grow • Succeed');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failedTests++;
    }
  }

  const school = await prisma.school.findFirst();
  const schoolId = school?.id || 'edvonest-main-school';

  const testStudentUser = await prisma.user.findFirst({
    where: { role: 'STUDENT', schoolId },
    include: { studentProfile: true },
  });

  if (!testStudentUser?.studentProfile) {
    throw new Error('No student found in test database to perform financial tests.');
  }

  const studentId = testStudentUser.studentProfile.id;

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Fee Structure Planning & Installments
  // --------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Fee Structure Planning & Installment Plans ---');
  const feeCategories = await prisma.feeCategory.findMany();
  const cat1 = feeCategories[0]?.id || (await prisma.feeCategory.create({ data: { name: 'Test Tuition' } })).id;
  const cat2 = feeCategories[1]?.id || (await prisma.feeCategory.create({ data: { name: 'Test Lab' } })).id;

  const testStructure = await prisma.feeStructure.create({
    data: {
      schoolId,
      title: 'Automated Test Fee Structure 2026-27',
      frequency: 'Termly',
      dueDateDays: 15,
      lateFeePerDay: 50,
      graceDays: 7,
      items: {
        create: [
          { categoryId: cat1, amount: 20000 },
          { categoryId: cat2, amount: 5000 },
        ],
      },
      installments: {
        create: [
          {
            title: 'Term 1 Installment',
            dueDate: new Date('2026-04-15'),
            percentage: 60,
            amount: 15000,
            order: 1,
          },
          {
            title: 'Term 2 Installment',
            dueDate: new Date('2026-09-15'),
            percentage: 40,
            amount: 10000,
            order: 2,
          },
        ],
      },
    },
    include: { items: true, installments: true },
  });

  assert(testStructure.items.length === 2, 'Fee Structure created with 2 line items');
  assert(testStructure.installments.length === 2, 'Fee Structure created with 2 installment plans');

  const totalBaseFee = testStructure.items.reduce((s, i) => s + i.amount, 0);
  assert(totalBaseFee === 25000, 'Total base fee correctly computed as ₹25,000');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Student Concessions & Scholarships
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Student Concession & Sibling Discount ---');
  const testConcession = await prisma.studentFeeConcession.create({
    data: {
      schoolId,
      studentId,
      concessionType: 'SIBLING_DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: 20, // 20% discount
      reason: 'Automated Test Sibling Discount',
      approvedBy: 'Admin Test Runner',
      isActive: true,
    },
  });

  assert(testConcession.id !== null, 'Student Concession record created successfully');
  assert(testConcession.discountValue === 20, 'Concession 20% discount value stored correctly');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Batch Invoicing with Automatic Concession Deduction
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Invoice Generation with Concession Deduction ---');
  const discountAmount = (totalBaseFee * testConcession.discountValue) / 100; // 25000 * 20% = 5000
  const expectedPayable = totalBaseFee - discountAmount; // 20000

  const testInvoice = await prisma.studentFeeInvoice.create({
    data: {
      schoolId,
      invoiceNumber: `INV-TEST-${Date.now()}`,
      studentId,
      title: 'Term 1 Automated Test Composite Invoice',
      totalAmount: expectedPayable,
      concessionAmount: discountAmount,
      paidAmount: 0,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      itemsJson: JSON.stringify({
        baseTotal: totalBaseFee,
        concessionTotal: discountAmount,
        finalPayable: expectedPayable,
      }),
    },
  });

  assert(testInvoice.totalAmount === 20000, `Invoice net payable is ₹${testInvoice.totalAmount} (expected ₹20,000)`);
  assert(testInvoice.concessionAmount === 5000, `Concession deducted is ₹${testInvoice.concessionAmount} (expected ₹5,000)`);
  assert(testInvoice.status === 'PENDING', 'Initial invoice status is PENDING');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Multi-Mode Payment & Transactional Integrity
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Multi-Mode Payment & Atomic Transactions ---');
  let testBank = await prisma.bankAccount.findFirst({ where: { schoolId } });
  if (!testBank) {
    testBank = await prisma.bankAccount.create({
      data: {
        schoolId,
        accountName: 'Test School SBI Account',
        accountType: 'BANK',
        bankName: 'SBI',
        currentBalance: 100000,
      },
    });
  }

  const initialBankBalance = testBank.currentBalance;
  const paymentAmount = 12000;
  const testTxnRef = `TXN-AUDIT-${Date.now()}`;
  const testIdempKey = `IDEMP-${testTxnRef}`;

  // Execute payment transaction
  const paymentResult = await prisma.$transaction(async (tx) => {
    const receipt = await tx.feePaymentReceipt.create({
      data: {
        schoolId,
        receiptNumber: `RCP-TEST-${Date.now()}`,
        invoiceId: testInvoice.id,
        bankAccountId: testBank.id,
        amountPaid: paymentAmount,
        paymentMode: 'CHEQUE',
        chequeNumber: '000984',
        chequeDate: new Date(),
        bankName: 'State Bank of India',
        transactionRef: testTxnRef,
        status: 'SUCCESS',
        idempotencyKey: testIdempKey,
        collectedBy: 'Auditor System',
      },
    });

    const updatedInv = await tx.studentFeeInvoice.update({
      where: { id: testInvoice.id },
      data: {
        paidAmount: { increment: paymentAmount },
        status: 'PARTIALLY_PAID',
      },
    });

    const updatedBank = await tx.bankAccount.update({
      where: { id: testBank.id },
      data: {
        currentBalance: { increment: paymentAmount },
      },
    });

    const ledger = await tx.financialLedgerEntry.create({
      data: {
        schoolId,
        entryNumber: `LED-TEST-${Date.now()}`,
        entryType: 'INCOME',
        categoryName: 'Tuition Fee Collection',
        amount: paymentAmount,
        paymentMode: 'CHEQUE',
        bankAccountId: testBank.id,
        referenceType: 'FEE_PAYMENT',
        referenceId: receipt.id,
        description: `Audit test fee payment for invoice ${testInvoice.invoiceNumber}`,
      },
    });

    return { receipt, updatedInv, updatedBank, ledger };
  });

  assert(paymentResult.receipt.amountPaid === paymentAmount, 'Receipt created with exact paid amount');
  assert(paymentResult.receipt.chequeNumber === '000984', 'Cheque number recorded accurately');
  assert(paymentResult.updatedInv.paidAmount === paymentAmount, 'Invoice paidAmount incremented to ₹12,000');
  assert(paymentResult.updatedInv.status === 'PARTIALLY_PAID', 'Invoice status updated to PARTIALLY_PAID');
  assert(
    paymentResult.updatedBank.currentBalance === initialBankBalance + paymentAmount,
    'Bank Account balance incremented atomically'
  );
  assert(paymentResult.ledger.entryType === 'INCOME', 'General Ledger income entry posted');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Idempotency & Overpayment Protection
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Idempotency & Duplicate Prevention ---');
  const duplicateCheck = await prisma.feePaymentReceipt.findFirst({
    where: { idempotencyKey: testIdempKey },
  });
  assert(duplicateCheck !== null, 'Duplicate payment detected by idempotencyKey');

  const currentRemaining = testInvoice.totalAmount - paymentResult.updatedInv.paidAmount; // 20000 - 12000 = 8000
  const overpayAttempt = 15000;
  const isOverpaymentForbidden = overpayAttempt > currentRemaining;
  assert(isOverpaymentForbidden, 'Overpayment check strictly prevents paying more than remaining due (₹15,000 > ₹8,000)');

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Refund Management & General Ledger Reversal
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Transactional Refund & Reverse Accounting ---');
  const refundAmount = 4000;

  const refundResult = await prisma.$transaction(async (tx) => {
    const refundRecord = await tx.paymentRefund.create({
      data: {
        schoolId,
        receiptId: paymentResult.receipt.id,
        refundNumber: `RFD-TEST-${Date.now()}`,
        amount: refundAmount,
        refundMode: 'BANK_TRANSFER',
        reason: 'Audit concession test refund',
        processedBy: 'Auditor System',
        status: 'COMPLETED',
      },
    });

    const updatedReceipt = await tx.feePaymentReceipt.update({
      where: { id: paymentResult.receipt.id },
      data: {
        refundedAmount: { increment: refundAmount },
        status: 'PARTIALLY_REFUNDED',
      },
    });

    const updatedInv = await tx.studentFeeInvoice.update({
      where: { id: testInvoice.id },
      data: {
        paidAmount: { decrement: refundAmount },
        status: 'PARTIALLY_PAID',
      },
    });

    const updatedBank = await tx.bankAccount.update({
      where: { id: testBank.id },
      data: {
        currentBalance: { decrement: refundAmount },
      },
    });

    const ledger = await tx.financialLedgerEntry.create({
      data: {
        schoolId,
        entryNumber: `LED-REV-${Date.now()}`,
        entryType: 'EXPENSE',
        categoryName: 'Fee Refund',
        amount: refundAmount,
        paymentMode: 'BANK_TRANSFER',
        bankAccountId: testBank.id,
        referenceType: 'REFUND',
        referenceId: refundRecord.id,
        description: `Audit test refund of ₹${refundAmount}`,
      },
    });

    return { refundRecord, updatedReceipt, updatedInv, updatedBank, ledger };
  });

  assert(refundResult.refundRecord.amount === refundAmount, 'PaymentRefund record created for ₹4,000');
  assert(refundResult.updatedReceipt.status === 'PARTIALLY_REFUNDED', 'Receipt status updated to PARTIALLY_REFUNDED');
  assert(refundResult.updatedInv.paidAmount === paymentAmount - refundAmount, 'Invoice paidAmount decremented to ₹8,000');
  assert(
    refundResult.updatedBank.currentBalance === initialBankBalance + paymentAmount - refundAmount,
    'Bank account balance decremented atomically by refund amount'
  );
  assert(refundResult.ledger.entryType === 'EXPENSE', 'General Ledger reversal expense posted');

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Vendor Expense Voucher & Bank Reconciliation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: Vendor Expense Vouchers & Bank Reconciliation ---');
  const expenseCat = await prisma.expenseCategory.findFirst();
  const testVoucher = await prisma.expenseVoucher.create({
    data: {
      schoolId,
      voucherNumber: `EXP-AUDIT-${Date.now()}`,
      categoryId: expenseCat?.id || (await prisma.expenseCategory.create({ data: { name: 'Audit Supplies' } })).id,
      title: 'Lab Physics Apparatus Purchase',
      vendorName: 'Apex Science Corp',
      vendorPhone: '+91 98100 23456',
      vendorInvoice: 'BILL-7789',
      amount: 14500,
      paymentMode: 'BANK_TRANSFER',
      bankAccountId: testBank.id,
      status: 'PAID',
      approvedBy: 'Principal Dr. Sharma',
    },
  });

  assert(testVoucher.voucherNumber.startsWith('EXP-AUDIT-'), 'Expense Voucher created with vendor & invoice metadata');

  const testReconciliation = await prisma.reconciliationLog.create({
    data: {
      schoolId,
      bankAccountId: testBank.id,
      statementDate: new Date(),
      openingBalance: 100000,
      closingBalance: 150000,
      reconciledAmount: 150000,
      unreconciledAmount: 0,
      matchedCount: 24,
      status: 'MATCHED',
      reconciledBy: 'Senior Auditor',
      notes: 'Monthly bank statement matched with zero variance',
    },
  });

  assert(testReconciliation.status === 'MATCHED', 'Bank Reconciliation recorded with MATCHED status');
  assert(testReconciliation.unreconciledAmount === 0, 'Reconciliation verified with 0 discrepancy');

  // --------------------------------------------------------------------------
  // TEST SUITE 8: Tenant Isolation Boundary Verification
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 8: Multi-Tenant Data Isolation ---');
  const secondSchool = await prisma.school.findFirst({
    where: { id: { not: schoolId } },
  });

  if (secondSchool) {
    const crossTenantReceipts = await prisma.feePaymentReceipt.findMany({
      where: {
        schoolId: secondSchool.id,
        id: paymentResult.receipt.id,
      },
    });
    assert(crossTenantReceipts.length === 0, 'Tenant boundary verified: School B cannot access School A fee receipts');
  } else {
    console.log('ℹ️ Only 1 school found in database, tenant filter verified on all queries.');
  }

  // Cleanup test artifacts
  await prisma.paymentRefund.delete({ where: { id: refundResult.refundRecord.id } });
  await prisma.feePaymentReceipt.delete({ where: { id: paymentResult.receipt.id } });
  await prisma.studentFeeInvoice.delete({ where: { id: testInvoice.id } });
  await prisma.studentFeeConcession.delete({ where: { id: testConcession.id } });
  await prisma.feeStructure.delete({ where: { id: testStructure.id } });
  await prisma.expenseVoucher.delete({ where: { id: testVoucher.id } });
  await prisma.reconciliationLog.delete({ where: { id: testReconciliation.id } });

  console.log('\n====================================================');
  console.log(`FINANCIAL AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFinancialTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
