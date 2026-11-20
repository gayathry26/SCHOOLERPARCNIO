import { prisma } from '../lib/db';

async function seedFinancialData() {
  console.log('--- Initializing Financial Management System Data ---');

  const school = await prisma.school.findFirst();
  const schoolId = school?.id || 'edvonest-main-school';

  // 1. Initialize Bank & Cash Accounts
  const existingAccounts = await prisma.bankAccount.findMany({ where: { schoolId } });
  if (existingAccounts.length === 0) {
    console.log('Creating initial Cash & Bank Accounts...');
    const hdfc = await prisma.bankAccount.create({
      data: {
        schoolId,
        accountName: 'Main School Operating Account',
        accountType: 'BANK',
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '50200084910293',
        ifscCode: 'HDFC0001234',
        branch: 'Sector 62, Noida',
        currentBalance: 850000,
        isActive: true,
      },
    });

    const sbi = await prisma.bankAccount.create({
      data: {
        schoolId,
        accountName: 'SBI Tuition Collection Account',
        accountType: 'BANK',
        bankName: 'State Bank of India',
        accountNumber: '3098452109832',
        ifscCode: 'SBIN0004567',
        branch: 'Commercial Hub, Sector 62',
        currentBalance: 420000,
        isActive: true,
      },
    });

    const cashDrawer = await prisma.bankAccount.create({
      data: {
        schoolId,
        accountName: 'Campus Cash Counter Register',
        accountType: 'CASH',
        bankName: 'Cash in Hand',
        accountNumber: 'CASH-COUNTER-01',
        branch: 'Accounts Desk 1',
        currentBalance: 35000,
        isActive: true,
      },
    });

    console.log(`Created 3 bank/cash accounts: ${hdfc.id}, ${sbi.id}, ${cashDrawer.id}`);
  }

  // 2. Initialize Fee Categories if not present
  const categories = await prisma.feeCategory.findMany();
  if (categories.length === 0) {
    console.log('Creating standard fee categories...');
    await prisma.feeCategory.createMany({
      data: [
        { name: 'Tuition Fee' },
        { name: 'Admission & Registration Fee' },
        { name: 'Science & Computer Lab Fee' },
        { name: 'Examination & Assessment Fee' },
        { name: 'Library & Digital Content Fee' },
        { name: 'Sports & Extracurricular Fee' },
        { name: 'Annual Development Fund' },
        { name: 'School Transport Fee' },
      ],
    });
  }

  // 3. Initialize Fee Structure Installments if empty
  const feeStructures = await prisma.feeStructure.findMany({
    include: { installments: true, items: true },
  });

  for (const fs of feeStructures) {
    if (fs.installments.length === 0) {
      console.log(`Adding installment plan to fee structure: ${fs.title}`);
      const curYear = new Date().getFullYear();
      await prisma.feeInstallmentPlan.createMany({
        data: [
          {
            feeStructureId: fs.id,
            title: 'Term 1 (April - June)',
            dueDate: new Date(`${curYear}-04-10`),
            percentage: 35.0,
            amount: 14000,
            order: 1,
          },
          {
            feeStructureId: fs.id,
            title: 'Term 2 (July - September)',
            dueDate: new Date(`${curYear}-07-10`),
            percentage: 25.0,
            amount: 10000,
            order: 2,
          },
          {
            feeStructureId: fs.id,
            title: 'Term 3 (October - December)',
            dueDate: new Date(`${curYear}-10-10`),
            percentage: 25.0,
            amount: 10000,
            order: 3,
          },
          {
            feeStructureId: fs.id,
            title: 'Term 4 (January - March)',
            dueDate: new Date(`${curYear + 1}-01-10`),
            percentage: 15.0,
            amount: 6000,
            order: 4,
          },
        ],
      });
    }
  }

  // 4. Concessions & Scholarships for sample students
  const students = await prisma.studentProfile.findMany({
    take: 5,
    include: { user: true, concessions: true },
  });

  if (students.length > 0 && students[0].concessions.length === 0) {
    console.log(`Adding sample concessions for student: ${students[0].user.firstName}`);
    await prisma.studentFeeConcession.create({
      data: {
        schoolId,
        studentId: students[0].id,
        concessionType: 'MERIT',
        discountType: 'PERCENTAGE',
        discountValue: 25.0,
        reason: 'Academic Excellence: Top 1% in Class 9 Board Prep Exam',
        approvedBy: 'Principal Dr. R. Sharma',
        isActive: true,
      },
    });

    if (students.length > 1) {
      await prisma.studentFeeConcession.create({
        data: {
          schoolId,
          studentId: students[1].id,
          concessionType: 'SIBLING_DISCOUNT',
          discountType: 'PERCENTAGE',
          discountValue: 15.0,
          reason: 'Second Child Enrolled in EdvoNest Academy',
          approvedBy: 'Accounts Committee',
          isActive: true,
        },
      });
    }
  }

  // 5. Seed General Ledger Entries
  const accounts = await prisma.bankAccount.findMany({ where: { schoolId } });
  const bankAcc = accounts.find((a) => a.accountType === 'BANK') || accounts[0];
  const cashAcc = accounts.find((a) => a.accountType === 'CASH') || accounts[0];

  const existingLedgerCount = await prisma.financialLedgerEntry.count({ where: { schoolId } });
  if (existingLedgerCount === 0 && bankAcc) {
    console.log('Seeding initial General Ledger Income and Expense records...');
    const curYear = new Date().getFullYear();
    await prisma.financialLedgerEntry.createMany({
      data: [
        {
          schoolId,
          entryNumber: `LED-${curYear}-001`,
          entryType: 'INCOME',
          categoryName: 'Tuition Fee Collection',
          amount: 245000,
          paymentMode: 'UPI',
          bankAccountId: bankAcc.id,
          referenceType: 'FEE_PAYMENT',
          description: 'Quarter 1 Tuition fee collection aggregate',
          transactionDate: new Date(`${curYear}-04-15`),
        },
        {
          schoolId,
          entryNumber: `LED-${curYear}-002`,
          entryType: 'INCOME',
          categoryName: 'Admission & Registration Fee',
          amount: 120000,
          paymentMode: 'NET_BANKING',
          bankAccountId: bankAcc.id,
          referenceType: 'FEE_PAYMENT',
          description: 'New Session 2026-27 Student Registration fees',
          transactionDate: new Date(`${curYear}-04-18`),
        },
        {
          schoolId,
          entryNumber: `LED-${curYear}-003`,
          entryType: 'EXPENSE',
          categoryName: 'Teacher & Staff Payroll',
          amount: 185000,
          paymentMode: 'BANK_TRANSFER',
          bankAccountId: bankAcc.id,
          referenceType: 'VENDOR_PAYMENT',
          description: 'Faculty Monthly Salary Disbursal for April',
          transactionDate: new Date(`${curYear}-04-30`),
        },
        {
          schoolId,
          entryNumber: `LED-${curYear}-004`,
          entryType: 'EXPENSE',
          categoryName: 'Science Lab Equipment & Consumables',
          amount: 32000,
          paymentMode: 'BANK_TRANSFER',
          bankAccountId: bankAcc.id,
          referenceType: 'VENDOR_PAYMENT',
          description: 'Physics & Chemistry lab upgrade apparatus (Vendor: Apex Lab Supplies)',
          transactionDate: new Date(`${curYear}-05-08`),
        },
        {
          schoolId,
          entryNumber: `LED-${curYear}-005`,
          entryType: 'INCOME',
          categoryName: 'Campus Counter Cash Fees',
          amount: 35000,
          paymentMode: 'CASH',
          bankAccountId: cashAcc?.id || bankAcc.id,
          referenceType: 'FEE_PAYMENT',
          description: 'Daily counter fee receipts collection',
          transactionDate: new Date(),
        },
      ],
    });
  }

  // 6. Link existing receipts to Bank Accounts if not linked
  if (bankAcc) {
    await prisma.feePaymentReceipt.updateMany({
      where: { bankAccountId: null },
      data: { bankAccountId: bankAcc.id },
    });
  }

  console.log('--- Financial Data Initialization Complete ---');
}

seedFinancialData()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
