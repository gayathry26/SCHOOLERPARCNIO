import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

async function verifyAllModules() {
  console.log('================================================================');
  console.log('EDVONEST — COMPREHENSIVE MYSQL ERP MODULE VERIFICATION SUITE');
  console.log('Database: schoolerpedvonest | Server: localhost:3306 (XAMPP)');
  console.log('Tagline: Learn • Grow • Succeed');
  console.log('================================================================\n');

  // 1. Connection & Heartbeat
  console.log('[1/15] Verifying MySQL Connection & Engine...');
  const dbPing = await prisma.$queryRaw<any[]>`SELECT DATABASE() as db, VERSION() as version, 1 as alive;`;
  console.log('Connected to MySQL Database:', dbPing[0]?.db, '| MySQL Version:', dbPing[0]?.version);
  if (dbPing[0]?.db !== 'schoolerpedvonest') {
    throw new Error(`Expected database schoolerpedvonest but got ${dbPing[0]?.db}`);
  }

  // 2. Authentication & Admin Accounts
  console.log('\n[2/15] Verifying Authentication & User Accounts...');
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@edvonest.com' },
    include: { school: true }
  });
  if (!admin) throw new Error('Admin user not found in MySQL');
  const passValid = await bcrypt.compare('password123', admin.passwordHash);
  console.log(`Admin User: ${admin.email} | Role: ${admin.role} | Password Valid: ${passValid} | Institution: ${admin.school?.name}`);

  const schoolId = admin.schoolId || 'edvonest-main-school';
  const academicYear = await prisma.academicYear.findFirst({ where: { schoolId } });
  if (!academicYear) throw new Error('Academic year not found');
  console.log(`Academic Session: ${academicYear.name} (Current: ${academicYear.isCurrent})`);

  // 3. Classes & Sections Management
  console.log('\n[3/15] Testing Classes & Sections Management...');
  let testClass = await prisma.class.findFirst({ where: { schoolId, name: 'Class 8' } });
  if (!testClass) {
    testClass = await prisma.class.create({
      data: {
        schoolId,
        name: 'Class 8',
        numericOrder: 8,
      }
    });
  }
  let testSection = await prisma.section.findFirst({ where: { classId: testClass.id, name: 'A' } });
  if (!testSection) {
    testSection = await prisma.section.create({
      data: {
        classId: testClass.id,
        name: 'A',
        roomNo: 'R-801',
      }
    });
  }
  console.log(`Class & Section: ${testClass.name} - Section ${testSection.name} (Section ID: ${testSection.id})`);

  // 4. Subjects
  console.log('\n[4/15] Verifying Subjects...');
  let subject = await prisma.subject.findFirst({ where: { name: 'Mathematics' } });
  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH-08',
      }
    });
  }
  console.log(`Subject: ${subject.name} (${subject.code})`);

  // 5. Teacher Profile & Teaching Allocation
  console.log('\n[5/15] Testing Teacher Creation & Allocation...');
  const teacherUser = await prisma.user.upsert({
    where: { email: 'test.teacher.mysql@edvonest.com' },
    update: {},
    create: {
      email: 'test.teacher.mysql@edvonest.com',
      username: 'teacher.mysql',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'TEACHER',
      firstName: 'Ramesh',
      lastName: 'Chandra',
      phone: '+91 98765 00112',
      schoolId,
    }
  });
  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { employeeCode: 'TCH-VERIFY-001' },
    update: { designation: 'TGT Mathematics Faculty', basicSalary: 56000 },
    create: {
      userId: teacherUser.id,
      employeeCode: 'TCH-VERIFY-001',
      qualification: 'M.Sc, B.Ed',
      specialization: 'Mathematics',
      designation: 'TGT Mathematics Faculty',
      basicSalary: 56000,
      status: 'ACTIVE',
    }
  });

  // Allocation
  let allocation = await prisma.teacherAllocation.findFirst({
    where: {
      teacherId: teacherProfile.id,
      sectionId: testSection.id,
      academicYearId: academicYear.id,
    }
  });
  if (!allocation) {
    allocation = await prisma.teacherAllocation.create({
      data: {
        academicYearId: academicYear.id,
        teacherId: teacherProfile.id,
        classId: testClass.id,
        sectionId: testSection.id,
        subjectId: subject.id,
        role: 'CLASS_TEACHER',
        periodsPerWeek: 6,
      }
    });
  }
  console.log(`Teacher: ${teacherProfile.employeeCode} allocated as ${allocation.role} in ${testClass.name}-${testSection.name}`);

  // 6. Student Profile & Enrollment
  console.log('\n[6/15] Testing Student Creation, Profile & Enrollment...');
  const studentUser = await prisma.user.upsert({
    where: { email: 'student.mysql.verify@edvonest.com' },
    update: {},
    create: {
      email: 'student.mysql.verify@edvonest.com',
      username: 'student.verify',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'STUDENT',
      firstName: 'Aarav',
      lastName: 'Kapoor',
      schoolId,
    }
  });
  const student = await prisma.studentProfile.upsert({
    where: { admissionNumber: 'EDV-2026-9999' },
    update: { rollNumber: '08-A-01' },
    create: {
      userId: studentUser.id,
      admissionNumber: 'EDV-2026-9999',
      rollNumber: '08-A-01',
      dob: new Date('2012-05-15'),
      gender: 'MALE',
      bloodGroup: 'B+',
      lifecycleStage: 'ACTIVE_ENROLLMENT',
    }
  });
  let enrollment = await prisma.studentEnrollment.findFirst({
    where: { studentId: student.id, academicYearId: academicYear.id }
  });
  if (!enrollment) {
    enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        academicYearId: academicYear.id,
        classId: testClass.id,
        sectionId: testSection.id,
        rollNumber: '08-A-01',
        status: 'ACTIVE',
      }
    });
  }
  console.log(`Student Enrolled: ${student.admissionNumber} (${studentUser.firstName} ${studentUser.lastName}) in ${testClass.name}-${testSection.name}`);

  // 7. Attendance Recording
  console.log('\n[7/15] Testing Attendance Recording in MySQL...');
  const attendance = await prisma.attendanceRecord.create({
    data: {
      studentId: student.id,
      academicYearId: academicYear.id,
      sectionId: testSection.id,
      date: new Date(),
      status: 'PRESENT',
      remarks: 'Prompt morning attendance',
    }
  });
  console.log(`Attendance Recorded: ID ${attendance.id} | Status: ${attendance.status}`);

  // 8. Timetable Management
  console.log('\n[8/15] Testing Timetable Slot Management...');
  let timetable = await prisma.timetableEntry.findFirst({
    where: {
      sectionId: testSection.id,
      dayOfWeek: 'MONDAY',
      periodIndex: 1,
    }
  });
  if (!timetable) {
    timetable = await prisma.timetableEntry.create({
      data: {
        academicYearId: academicYear.id,
        sectionId: testSection.id,
        subjectId: subject.id,
        teacherId: teacherProfile.id,
        dayOfWeek: 'MONDAY',
        periodIndex: 1,
        startTime: '08:00',
        endTime: '08:45',
        roomNumber: 'R-801',
      }
    });
  }
  console.log(`Timetable Entry: ${timetable.dayOfWeek} Period ${timetable.periodIndex} in ${timetable.roomNumber}`);

  // 9. Homework Creation
  console.log('\n[9/15] Testing Homework Module...');
  const homework = await prisma.homework.create({
    data: {
      classId: testClass.id,
      sectionId: testSection.id,
      subjectId: subject.id,
      title: 'Linear Equations in One Variable - Ex 2.1',
      description: 'Solve questions 1 through 10 in standard homework notebook.',
      dueDate: new Date(Date.now() + 86400000 * 3),
      maxMarks: 10,
    }
  });
  console.log(`Homework Created: "${homework.title}" due on ${homework.dueDate.toISOString().split('T')[0]}`);

  // 10. Examinations & Result Entry
  console.log('\n[10/15] Testing Examination & Marks Recording...');
  let exam = await prisma.exam.findFirst();
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        academicYearId: academicYear.id,
        name: 'Unit Assessment I - 2026',
        term: 'TERM 1',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 5),
      }
    });
  }
  let examSchedule = await prisma.examSchedule.findFirst({
    where: { examId: exam.id, subjectId: subject.id }
  });
  if (!examSchedule) {
    examSchedule = await prisma.examSchedule.create({
      data: {
        examId: exam.id,
        subjectId: subject.id,
        examDate: new Date(),
        maxMarks: 50,
        passMarks: 17,
      }
    });
  }
  const markEntry = await prisma.examMarkEntry.create({
    data: {
      examScheduleId: examSchedule.id,
      studentId: student.id,
      theoryMarks: 46.5,
      remarks: 'Outstanding conceptual clarity',
    }
  });
  console.log(`Exam Result Recorded: Student scored ${markEntry.theoryMarks}/50 in theory exam`);

  // 11. Fee Management & Invoices
  console.log('\n[11/15] Testing Fee Invoicing & Payment Receipts...');
  const feeInvoice = await prisma.studentFeeInvoice.create({
    data: {
      schoolId,
      studentId: student.id,
      academicYearId: academicYear.id,
      title: 'Term I Composite Tuition Fee',
      invoiceNumber: `INV-VERIFY-${Date.now().toString().slice(-6)}`,
      totalAmount: 18500,
      paidAmount: 18500,
      dueDate: new Date(),
      status: 'PAID',
    }
  });
  const receipt = await prisma.feePaymentReceipt.create({
    data: {
      schoolId,
      invoiceId: feeInvoice.id,
      receiptNumber: `REC-VERIFY-${Date.now().toString().slice(-6)}`,
      amountPaid: 18500,
      paymentMode: 'UPI',
      transactionRef: `UPI-RRR-${Date.now()}`,
      paidAt: new Date(),
      status: 'SUCCESS',
      collectedBy: 'Accounts Bureau',
    }
  });
  console.log(`Fee Invoice ${feeInvoice.invoiceNumber} paid in full. Receipt: ${receipt.receiptNumber}`);

  // 12. Library Transactions
  console.log('\n[12/15] Testing Library Module...');
  let book = await prisma.libraryBook.findFirst({ where: { isbn: '978-8174507001' } });
  if (!book) {
    book = await prisma.libraryBook.create({
      data: {
        title: 'NCERT Exemplar Mathematics Class 8',
        isbn: '978-8174507001',
        author: 'NCERT Editorial Board',
        category: 'ACADEMIC',
        totalCopies: 5,
        availableCopies: 4,
      }
    });
  }
  const issueRecord = await prisma.bookIssueRecord.create({
    data: {
      bookId: book.id,
      studentId: student.id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 14),
      status: 'ISSUED',
    }
  });
  console.log(`Library Book "${book.title}" issued to student. Return due: ${issueRecord.dueDate.toISOString().split('T')[0]}`);

  // 13. Transport Fleet
  console.log('\n[13/15] Testing Transport Module...');
  let vehicle = await prisma.vehicle.findFirst({ where: { vehicleNumber: 'UP-16-ED-8844' } });
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'UP-16-ED-8844',
        model: 'Tata Starbus 40-Seater',
        seatingCapacity: 45,
      }
    });
  }
  const route = await prisma.route.create({
    data: {
      vehicleId: vehicle.id,
      routeName: `Route 12 - Sector 62 (${Date.now().toString().slice(-4)})`,
      startPoint: 'Sector 62 Metro',
      endPoint: 'EdvoNest Main Campus',
      totalDistanceKm: 18.5,
    }
  });
  console.log(`Transport Route "${route.routeName}" connected to Vehicle ${vehicle.vehicleNumber}`);

  // 14. HR, Payroll & Lifecycle Logs
  console.log('\n[14/15] Testing HR Lifecycle & Salary History...');
  const salHistory = await prisma.staffSalaryHistory.create({
    data: {
      teacherId: teacherProfile.id,
      previousSalary: 52000,
      newSalary: 56000,
      effectiveDate: new Date(),
      reason: 'MySQL Migration Verified Annual Increment',
      revisedBy: 'SUPER_ADMIN',
    }
  });
  const lifecycleLog = await prisma.staffLifecycleLog.create({
    data: {
      teacherId: teacherProfile.id,
      employeeCode: teacherProfile.employeeCode,
      action: 'SALARY_REVISION',
      previousValue: '52000',
      newValue: '56000',
      effectiveDate: new Date(),
      remarks: 'Verified live write to MySQL StaffLifecycleLog',
      recordedBy: 'SUPER_ADMIN',
    }
  });
  console.log(`Salary History recorded: ID ${salHistory.id} | Lifecycle Log: ID ${lifecycleLog.id}`);

  // 15. Audit Logs & System Notifications
  console.log('\n[15/15] Testing Audit Trails & Notifications...');
  const audit = await prisma.auditLog.create({
    data: {
      schoolId,
      userId: admin.id,
      action: 'MYSQL_ERP_MIGRATION_VERIFIED',
      module: 'SYSTEM_SETTINGS',
      recordId: schoolId,
      newValue: 'All ERP modules successfully reading and writing to XAMPP MySQL database schoolerpedvonest',
    }
  });
  const notification = await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Database Engine Migration Complete',
      message: 'EdvoNest is now operating with XAMPP MySQL database schoolerpedvonest as the single source of truth.',
      type: 'SYSTEM',
    }
  });
  console.log(`Audit Log Created: ID ${audit.id} | Notification Created: ID ${notification.id}`);

  console.log('\n================================================================');
  console.log('✅ ALL 15 CORE MODULES READ & WRITE PERSISTENCE IN MYSQL CONFIRMED!');
  console.log('Database Name: schoolerpedvonest');
  console.log('Host: localhost:3306');
  console.log('User: root (XAMPP default)');
  console.log('ORM: Prisma ORM (datasource: mysql)');
  console.log('Single Source of Truth: ACTIVE & VERIFIED');
  console.log('================================================================');
}

verifyAllModules()
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
