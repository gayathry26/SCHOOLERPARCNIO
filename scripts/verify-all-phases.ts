import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runFullVerification() {
  console.log('=================================================================');
  console.log('EDVONEST ERP — ALL 6 PHASES AUTOMATED VERIFICATION SUITE');
  console.log('=================================================================\n');

  const results: Record<string, { status: 'PASS' | 'FAIL'; count?: number; error?: string }> = {};

  async function check(name: string, fn: () => Promise<number>) {
    try {
      const count = await fn();
      results[name] = { status: 'PASS', count };
      console.log(`[PASS] ${name.padEnd(45)} Count: ${count}`);
    } catch (err: any) {
      results[name] = { status: 'FAIL', error: err.message };
      console.error(`[FAIL] ${name.padEnd(45)} Error: ${err.message}`);
    }
  }

  console.log('--- PHASE 1: CORE SCHOOL ERP ---');
  await check('1.1 Student Profiles', () => prisma.studentProfile.count());
  await check('1.2 Admission Applications', () => prisma.admissionApplication.count());
  await check('1.3 Classes & Wings', () => prisma.class.count());
  await check('1.4 Academic Years', () => prisma.academicYear.count());
  await check('1.5 Attendance Records', () => prisma.attendanceRecord.count());
  await check('1.6 Timetable Entries', () => prisma.timetableEntry.count());

  console.log('\n--- PHASE 2: ACADEMIC, FINANCE & HR ---');
  await check('2.1 Examination Records', () => prisma.exam.count());
  await check('2.2 Exam Mark Entries', () => prisma.examMarkEntry.count());
  await check('2.3 Homework & Assignments', () => prisma.homework.count());
  await check('2.4 Student Fee Invoices', () => prisma.studentFeeInvoice.count());
  await check('2.5 Fee Payment Receipts', () => prisma.feePaymentReceipt.count());
  await check('2.6 Financial Expense Vouchers', () => prisma.expenseVoucher.count());
  await check('2.7 Staff Directory & HR', () => prisma.staffProfile.count());
  await check('2.8 Staff Salary Slips', () => prisma.staffSalarySlip.count());

  console.log('\n--- PHASE 3: CAMPUS OPERATIONS ---');
  await check('3.1 Transport Vehicles & GPS', () => prisma.vehicle.count());
  await check('3.2 Transport Routes', () => prisma.route.count());
  await check('3.3 Library Catalog Books', () => prisma.libraryBook.count());
  await check('3.4 Hostel Buildings', () => prisma.hostelBuilding.count());
  await check('3.5 Hostel Rooms', () => prisma.hostelRoom.count());
  await check('3.6 Inventory & Assets Master', () => prisma.assetItem.count());
  await check('3.7 Security & Visitor Passes', () => prisma.visitorPass.count());
  await check('3.8 Student Health Profiles', () => prisma.studentHealthProfile.count());

  console.log('\n--- PHASE 4: STAKEHOLDER PORTALS & ECOSYSTEM ---');
  await check('4.1 Parent Profiles', () => prisma.parentProfile.count());
  await check('4.2 PTM Conference Events', () => prisma.ptmEvent.count());
  await check('4.3 Announcements & Circulars', () => prisma.announcement.count());
  await check('4.4 Certificate Templates', () => prisma.certificateTemplate.count());
  await check('4.5 School Calendar Events', () => prisma.schoolEvent.count());
  await check('4.6 CMS Pages', () => prisma.cmsPage.count());

  console.log('\n--- PHASE 5: AI-POWERED SCHOOL INTELLIGENCE ---');
  await check('5.1 AI Academic Alerts', () => prisma.academicAlert.count());
  await check('5.2 AI Learning Paths', () => prisma.learningPath.count());
  await check('5.3 Question Bank Repository', () => prisma.question.count());
  await check('5.4 Question Paper Generator', () => prisma.questionPaper.count());

  console.log('\n--- PHASE 6: ENTERPRISE & MULTI-CAMPUS ---');
  await check('6.1 Main School Institution', () => prisma.school.count());
  await check('6.2 Multi-Campus Branches', () => prisma.campusBranch.count());
  await check('6.3 System Audit Logs', () => prisma.auditLog.count());
  await check('6.4 SaaS Subscription Plans', () => prisma.subscriptionPlan.count());

  console.log('\n=================================================================');
  const allPass = Object.values(results).every((r) => r.status === 'PASS');
  console.log(`OVERALL VERIFICATION RESULT: ${allPass ? 'ALL CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`);
  console.log('=================================================================');
}

runFullVerification()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
