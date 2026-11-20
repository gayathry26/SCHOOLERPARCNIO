import { prisma } from '../../lib/db';

async function auditDatabase() {
  console.log('=== EDVONEST DATABASE INTEGRITY AUDIT ===\n');

  // Check counts
  const userCount = await prisma.user.count();
  const studentCount = await prisma.studentProfile.count();
  const teacherCount = await prisma.teacherProfile.count();
  const staffCount = await prisma.staffProfile.count();
  const classCount = await prisma.class.count();
  const sectionCount = await prisma.section.count();
  const attendanceCount = await prisma.attendanceRecord.count();
  const invoiceCount = await prisma.studentFeeInvoice.count();
  const receiptCount = await prisma.feePaymentReceipt.count();
  const examCount = await prisma.exam.count();
  const markCount = await prisma.examMarkEntry.count();
  const vehicleCount = await prisma.vehicle.count();
  const routeCount = await prisma.route.count();

  console.log(`Database Counts:
  - Users: ${userCount}
  - Students: ${studentCount}
  - Teachers: ${teacherCount}
  - Staff: ${staffCount}
  - Classes: ${classCount}
  - Sections: ${sectionCount}
  - Attendance Records: ${attendanceCount}
  - Fee Invoices: ${invoiceCount}
  - Payment Receipts: ${receiptCount}
  - Exams: ${examCount}
  - Exam Mark Entries: ${markCount}
  - Vehicles: ${vehicleCount}
  - Transport Routes: ${routeCount}
  `);

  // Check duplicate emails
  const users = await prisma.user.findMany({ select: { email: true, username: true } });
  const emailSet = new Set();
  const duplicateEmails: string[] = [];
  users.forEach(u => {
    if (emailSet.has(u.email)) duplicateEmails.push(u.email);
    emailSet.add(u.email);
  });
  console.log(`Duplicate emails: ${duplicateEmails.length > 0 ? duplicateEmails.join(', ') : 'None (0)'}`);

  // Check duplicate admission numbers
  const students = await prisma.studentProfile.findMany({ select: { admissionNumber: true } });
  const admSet = new Set();
  const duplicateAdms: string[] = [];
  students.forEach(s => {
    if (admSet.has(s.admissionNumber)) duplicateAdms.push(s.admissionNumber);
    admSet.add(s.admissionNumber);
  });
  console.log(`Duplicate admission numbers: ${duplicateAdms.length > 0 ? duplicateAdms.join(', ') : 'None (0)'}`);

  // Check duplicate exam mark entries (same student + schedule)
  const marks = await prisma.examMarkEntry.findMany({ select: { id: true, studentId: true, examScheduleId: true } });
  const markPairSet = new Set();
  const duplicateMarks: string[] = [];
  marks.forEach(m => {
    const pair = `${m.studentId}_${m.examScheduleId}`;
    if (markPairSet.has(pair)) duplicateMarks.push(m.id);
    markPairSet.add(pair);
  });
  console.log(`Duplicate exam mark entries: ${duplicateMarks.length > 0 ? duplicateMarks.join(', ') : 'None (0)'}`);

  // Check invoice balance consistency
  const allInvoices = await prisma.studentFeeInvoice.findMany({ select: { id: true, paidAmount: true, totalAmount: true } });
  const inconsistentInvoices = allInvoices.filter(i => i.paidAmount > i.totalAmount);
  console.log(`Invoices with paidAmount > totalAmount: ${inconsistentInvoices.length}`);
  console.log('Integrity audit checks completed successfully.');
}

auditDatabase()
  .catch(console.error)
  .finally(() => process.exit(0));
