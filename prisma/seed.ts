import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EDVONEST Database...');

  // 1. Create School
  const school = await prisma.school.upsert({
    where: { id: 'edvonest-main-school' },
    update: {},
    create: {
      id: 'edvonest-main-school',
      name: 'Edvonest Model International Academy',
      affiliationNo: 'CBSE/AFF/2026/89410',
      board: 'CBSE',
      email: 'contact@edvonest-academy.edu.in',
      phone: '+91 11 4982 3000',
      address: 'Plot 12, Institutional Area, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      currencySymbol: '₹',
      currencyCode: 'INR',
      attendanceThreshold: 75.0,
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Departments
  const deptAdmin = await prisma.department.create({ data: { name: 'School Administration' } });
  const deptAcademics = await prisma.department.create({ data: { name: 'Academics & Faculty' } });
  const deptFinance = await prisma.department.create({ data: { name: 'Finance & Accounts' } });
  const deptHR = await prisma.department.create({ data: { name: 'Human Resources' } });
  const deptTransport = await prisma.department.create({ data: { name: 'Transport & Fleet' } });
  const deptLibrary = await prisma.department.create({ data: { name: 'Library & Information' } });

  // 3. Create Core Demo Users
  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'admin@edvonest.com',
      username: 'admin',
      passwordHash,
      role: 'SCHOOL_ADMIN',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      phone: '+91 98101 22334',
      schoolId: school.id,
    },
  });

  const userPrincipal = await prisma.user.upsert({
    where: { email: 'principal@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'principal@edvonest.com',
      username: 'principal',
      passwordHash,
      role: 'PRINCIPAL',
      firstName: 'Dr. Sunita',
      lastName: 'Mehra',
      phone: '+91 98111 33445',
      schoolId: school.id,
    },
  });

  const userTeacherMath = await prisma.user.upsert({
    where: { email: 'teacher.math@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'teacher.math@edvonest.com',
      username: 'teacher.math',
      passwordHash,
      role: 'TEACHER',
      firstName: 'Vikram',
      lastName: 'Verma',
      phone: '+91 98222 44556',
      schoolId: school.id,
    },
  });

  const userTeacherScience = await prisma.user.upsert({
    where: { email: 'teacher.science@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'teacher.science@edvonest.com',
      username: 'teacher.science',
      passwordHash,
      role: 'TEACHER',
      firstName: 'Dr. Ananya',
      lastName: 'Sen',
      phone: '+91 98333 55667',
      schoolId: school.id,
    },
  });

  const userAccountant = await prisma.user.upsert({
    where: { email: 'accountant@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'accountant@edvonest.com',
      username: 'accountant',
      passwordHash,
      role: 'ACCOUNTANT',
      firstName: 'Ramesh',
      lastName: 'Gupta',
      phone: '+91 98444 66778',
      schoolId: school.id,
    },
  });

  const userHR = await prisma.user.upsert({
    where: { email: 'hr@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'hr@edvonest.com',
      username: 'hr',
      passwordHash,
      role: 'HR_MANAGER',
      firstName: 'Pooja',
      lastName: 'Nair',
      phone: '+91 98555 77889',
      schoolId: school.id,
    },
  });

  const userParent1 = await prisma.user.upsert({
    where: { email: 'parent1@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'parent1@edvonest.com',
      username: 'parent1',
      passwordHash,
      role: 'PARENT',
      firstName: 'Amit',
      lastName: 'Verma',
      phone: '+91 98666 88990',
      schoolId: school.id,
    },
  });

  const userStudent1 = await prisma.user.upsert({
    where: { email: 'student1@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'student1@edvonest.com',
      username: 'student1',
      passwordHash,
      role: 'STUDENT',
      firstName: 'Aarav',
      lastName: 'Verma',
      phone: '+91 98666 88990',
      schoolId: school.id,
    },
  });

  const userTransport = await prisma.user.upsert({
    where: { email: 'transport@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'transport@edvonest.com',
      username: 'transport',
      passwordHash,
      role: 'TRANSPORT_STAFF',
      firstName: 'Harpal',
      lastName: 'Singh',
      phone: '+91 98777 99001',
      schoolId: school.id,
    },
  });

  const userLibrarian = await prisma.user.upsert({
    where: { email: 'librarian@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'librarian@edvonest.com',
      username: 'librarian',
      passwordHash,
      role: 'LIBRARIAN',
      firstName: 'Meenakshi',
      lastName: 'Sundaram',
      phone: '+91 98888 00112',
      schoolId: school.id,
    },
  });

  const userSuperAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@edvonest.com' },
    update: { passwordHash },
    create: {
      email: 'superadmin@edvonest.com',
      username: 'superadmin',
      passwordHash,
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Director',
      phone: '+91 99999 11223',
      schoolId: school.id,
    },
  });

  // 4. Create Staff Profiles
  await prisma.staffProfile.upsert({
    where: { userId: userAccountant.id },
    update: {},
    create: {
      userId: userAccountant.id,
      employeeCode: 'EMP-ACC-01',
      designation: 'Senior Accountant',
      departmentId: deptFinance.id,
      basicSalary: 55000,
    },
  });

  const hrStaff = await prisma.staffProfile.upsert({
    where: { userId: userHR.id },
    update: {},
    create: {
      userId: userHR.id,
      employeeCode: 'EMP-HR-01',
      designation: 'HR Officer',
      departmentId: deptHR.id,
      basicSalary: 52000,
    },
  });

  const transportStaff = await prisma.staffProfile.upsert({
    where: { userId: userTransport.id },
    update: {},
    create: {
      userId: userTransport.id,
      employeeCode: 'EMP-TRN-01',
      designation: 'Fleet Supervisor & Senior Driver',
      departmentId: deptTransport.id,
      basicSalary: 32000,
    },
  });

  await prisma.staffProfile.upsert({
    where: { userId: userLibrarian.id },
    update: {},
    create: {
      userId: userLibrarian.id,
      employeeCode: 'EMP-LIB-01',
      designation: 'Chief Librarian',
      departmentId: deptLibrary.id,
      basicSalary: 48000,
    },
  });

  // 5. Create Teacher Profiles
  const teacherMath = await prisma.teacherProfile.upsert({
    where: { userId: userTeacherMath.id },
    update: {},
    create: {
      userId: userTeacherMath.id,
      employeeCode: 'TCH-MAT-101',
      specialization: 'Mathematics (Class 9-12)',
      qualification: 'M.Sc. Mathematics, B.Ed',
      basicSalary: 58000,
    },
  });

  const teacherScience = await prisma.teacherProfile.upsert({
    where: { userId: userTeacherScience.id },
    update: {},
    create: {
      userId: userTeacherScience.id,
      employeeCode: 'TCH-SCI-102',
      specialization: 'Physics & General Science',
      qualification: 'Ph.D. Physics, B.Ed',
      basicSalary: 62000,
    },
  });

  // 6. Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025–2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });

  // 7. Create Classes & Sections
  const class10 = await prisma.class.create({
    data: {
      name: 'Class 10',
      numericOrder: 10,
      stream: 'General',
      academicYearId: academicYear.id,
    },
  });

  const sec10A = await prisma.section.create({
    data: {
      name: 'A',
      roomNo: 'Room 1001',
      classId: class10.id,
      classTeacherId: teacherMath.id,
    },
  });

  const sec10B = await prisma.section.create({
    data: {
      name: 'B',
      roomNo: 'Room 1002',
      classId: class10.id,
      classTeacherId: teacherScience.id,
    },
  });

  const class9 = await prisma.class.create({
    data: {
      name: 'Class 9',
      numericOrder: 9,
      stream: 'General',
      academicYearId: academicYear.id,
    },
  });

  await prisma.section.create({
    data: { name: 'A', roomNo: 'Room 901', classId: class9.id },
  });

  const class11 = await prisma.class.create({
    data: {
      name: 'Class 11',
      numericOrder: 11,
      stream: 'Science (PCM/PCB)',
      academicYearId: academicYear.id,
    },
  });

  await prisma.section.create({
    data: { name: 'A', roomNo: 'Room 1101', classId: class11.id },
  });

  // 8. Create Subjects
  const subMath = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH-10',
      classId: class10.id,
    },
  });

  const subScience = await prisma.subject.create({
    data: {
      name: 'Science (Physics/Chemistry)',
      code: 'SCI-10',
      classId: class10.id,
    },
  });

  const subEnglish = await prisma.subject.create({
    data: {
      name: 'English Language & Literature',
      code: 'ENG-10',
      classId: class10.id,
    },
  });

  const subSocial = await prisma.subject.create({
    data: {
      name: 'Social Science',
      code: 'SST-10',
      classId: class10.id,
    },
  });

  // Link Teachers to Subjects
  await prisma.teacherSubject.create({
    data: { teacherId: teacherMath.id, subjectId: subMath.id },
  });
  await prisma.teacherSubject.create({
    data: { teacherId: teacherScience.id, subjectId: subScience.id },
  });

  // Study Materials
  await prisma.studyMaterial.create({
    data: {
      subjectId: subMath.id,
      title: 'Class 10 Trigonometry Formula Sheet & NCERT Solutions',
      description: 'Comprehensive identities, height & distance formula sheet.',
      fileType: 'PDF',
      fileUrl: '/materials/math_trig_cheatsheet.pdf',
    },
  });
  await prisma.studyMaterial.create({
    data: {
      subjectId: subScience.id,
      title: 'Light - Reflection & Refraction Chapter Notes',
      description: 'Ray diagrams, sign conventions, lens formula examples.',
      fileType: 'PDF',
      fileUrl: '/materials/science_light_notes.pdf',
    },
  });

  // 9. Create Student Profile & Parent Profile for Aarav Verma
  const studentProfile1 = await prisma.studentProfile.upsert({
    where: { userId: userStudent1.id },
    update: {},
    create: {
      userId: userStudent1.id,
      admissionNumber: 'EDV-2023-0101',
      rollNumber: '10A01',
      dob: new Date('2010-06-15'),
      gender: 'MALE',
      bloodGroup: 'B+',
      address: 'B-144, Sector 50',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      emergencyContact: '+91 98666 88990',
      house: 'Emerald',
      previousSchool: 'Delhi Public School Noida',
    },
  });

  const parentProfile1 = await prisma.parentProfile.upsert({
    where: { userId: userParent1.id },
    update: {},
    create: {
      userId: userParent1.id,
      relation: 'Father',
      occupation: 'Software Engineering Director',
      phone: '+91 98666 88990',
      address: 'B-144, Sector 50, Noida',
    },
  });

  await prisma.studentParentMap.create({
    data: {
      studentId: studentProfile1.id,
      parentId: parentProfile1.id,
      isPrimary: true,
    },
  });

  // Enroll student1 in 10-A
  await prisma.studentEnrollment.create({
    data: {
      studentId: studentProfile1.id,
      academicYearId: academicYear.id,
      classId: class10.id,
      sectionId: sec10A.id,
      rollNumber: '10A01',
      status: 'ACTIVE',
    },
  });

  // Create additional students for realistic class view
  const moreStudents = [
    { first: 'Diya', last: 'Sharma', gender: 'FEMALE', blood: 'O+', roll: '10A02', adm: 'EDV-2023-0102' },
    { first: 'Rohan', last: 'Kapoor', gender: 'MALE', blood: 'A+', roll: '10A03', adm: 'EDV-2023-0103' },
    { first: 'Ananya', last: 'Pandey', gender: 'FEMALE', blood: 'AB+', roll: '10A04', adm: 'EDV-2023-0104' },
    { first: 'Kabir', last: 'Mehta', gender: 'MALE', blood: 'B-', roll: '10A05', adm: 'EDV-2023-0105' },
    { first: 'Ishaan', last: 'Joshi', gender: 'MALE', blood: 'O-', roll: '10A06', adm: 'EDV-2023-0106' },
  ];

  for (const st of moreStudents) {
    const u = await prisma.user.create({
      data: {
        email: `${st.first.toLowerCase()}.${st.last.toLowerCase()}@edvonest.com`,
        username: st.adm.toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        firstName: st.first,
        lastName: st.last,
        phone: '+91 98000 12345',
        schoolId: school.id,
      },
    });

    const sp = await prisma.studentProfile.create({
      data: {
        userId: u.id,
        admissionNumber: st.adm,
        rollNumber: st.roll,
        dob: new Date('2010-08-20'),
        gender: st.gender,
        bloodGroup: st.blood,
        address: 'Sector 62, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        emergencyContact: '+91 98000 12345',
        house: 'Ruby',
      },
    });

    await prisma.studentEnrollment.create({
      data: {
        studentId: sp.id,
        academicYearId: academicYear.id,
        classId: class10.id,
        sectionId: sec10A.id,
        rollNumber: st.roll,
        status: 'ACTIVE',
      },
    });

    // Seed past attendance
    await prisma.attendanceRecord.create({
      data: {
        studentId: sp.id,
        academicYearId: academicYear.id,
        sectionId: sec10A.id,
        date: new Date(),
        status: 'PRESENT',
      },
    });
  }

  // Attendance for Aarav Verma
  await prisma.attendanceRecord.create({
    data: {
      studentId: studentProfile1.id,
      academicYearId: academicYear.id,
      sectionId: sec10A.id,
      date: new Date(),
      status: 'PRESENT',
      remarks: 'On time, active participation',
    },
  });

  // 10. Fee Categories & Structures
  const catTuition = await prisma.feeCategory.create({ data: { name: 'Tuition Fee' } });
  const catLab = await prisma.feeCategory.create({ data: { name: 'Science & Computer Lab Fee' } });
  const catTransport = await prisma.feeCategory.create({ data: { name: 'Bus Transport Fee' } });
  const catDev = await prisma.feeCategory.create({ data: { name: 'Annual Development Fee' } });

  const feeStruct10 = await prisma.feeStructure.create({
    data: {
      title: 'Class 10 CBSE Quarterly Composite Fee',
      classId: class10.id,
      academicYearId: academicYear.id,
      frequency: 'Quarterly',
      dueDateDays: 10,
      items: {
        create: [
          { categoryId: catTuition.id, amount: 28000 },
          { categoryId: catLab.id, amount: 4500 },
          { categoryId: catDev.id, amount: 3500 },
        ],
      },
    },
  });

  // Invoices for student1
  const inv1 = await prisma.studentFeeInvoice.create({
    data: {
      invoiceNumber: 'INV-2025-Q1-0081',
      studentId: studentProfile1.id,
      title: 'Term 1 / Q1 Composite Tuition Fee (Apr - Jun 2025)',
      totalAmount: 36000,
      paidAmount: 36000,
      status: 'PAID',
      dueDate: new Date('2025-04-10'),
    },
  });

  await prisma.feePaymentReceipt.create({
    data: {
      receiptNumber: 'RCP-2025-04-1102',
      invoiceId: inv1.id,
      amountPaid: 36000,
      paymentMode: 'RAZORPAY',
      transactionRef: 'RZP_TXN_9918237',
      razorpayPaymentId: 'pay_NzY2291048',
      collectedBy: 'Online Gateway (Razorpay)',
      notes: 'Paid via NetBanking HDFC',
      paidAt: new Date('2025-04-08'),
    },
  });

  const inv2 = await prisma.studentFeeInvoice.create({
    data: {
      invoiceNumber: 'INV-2025-Q2-0199',
      studentId: studentProfile1.id,
      title: 'Term 2 / Q2 Composite Tuition Fee (Jul - Sep 2025)',
      totalAmount: 36000,
      paidAmount: 23500,
      status: 'PARTIALLY_PAID',
      dueDate: new Date('2025-07-10'),
    },
  });

  await prisma.feePaymentReceipt.create({
    data: {
      receiptNumber: 'RCP-2025-07-2291',
      invoiceId: inv2.id,
      amountPaid: 23500,
      paymentMode: 'UPI',
      transactionRef: 'UPI-4491029381',
      collectedBy: 'Accounts Office (Mr. Ramesh Gupta)',
      notes: 'Partial payment received via GPay',
      paidAt: new Date('2025-07-09'),
    },
  });

  // 11. Finance Expenses
  const expCat1 = await prisma.expenseCategory.create({ data: { name: 'Campus Maintenance & Repairs' } });
  const expCat2 = await prisma.expenseCategory.create({ data: { name: 'Science Lab Equipment & Consumables' } });
  const expCat3 = await prisma.expenseCategory.create({ data: { name: 'Electricity & Utility Bills' } });

  await prisma.expenseVoucher.create({
    data: {
      voucherNumber: 'EXP-2025-0901',
      categoryId: expCat2.id,
      title: 'Glassware & Chemicals for Class 10 Chemistry Lab',
      vendorName: 'Borosil Scientific Supplies Ltd.',
      amount: 24500,
      paymentMode: 'BANK_TRANSFER',
      approvedBy: 'Rajesh Sharma (SCHOOL_ADMIN)',
      notes: 'CBSE inspection lab upgrade requirement',
    },
  });

  await prisma.expenseVoucher.create({
    data: {
      voucherNumber: 'EXP-2025-0902',
      categoryId: expCat1.id,
      title: 'Air Conditioning Servicing - Block A & B',
      vendorName: 'Voltas Facility Care Services',
      amount: 18200,
      paymentMode: 'CHEQUE',
      approvedBy: 'Ramesh Gupta (ACCOUNTANT)',
      notes: 'Annual AMC payment',
    },
  });

  // 12. Exams & Mark Entries
  const examMidTerm = await prisma.exam.create({
    data: {
      name: 'Mid-Term Assessment Examinations 2025',
      term: 'TERM 1',
      academicYearId: academicYear.id,
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-09-28'),
      isLocked: false,
      isPublished: true,
    },
  });

  const schMath = await prisma.examSchedule.create({
    data: {
      examId: examMidTerm.id,
      subjectId: subMath.id,
      examDate: new Date('2025-09-16'),
      maxMarks: 100,
      passMarks: 33,
    },
  });

  const schScience = await prisma.examSchedule.create({
    data: {
      examId: examMidTerm.id,
      subjectId: subScience.id,
      examDate: new Date('2025-09-19'),
      maxMarks: 100,
      passMarks: 33,
    },
  });

  await prisma.examMarkEntry.create({
    data: {
      examScheduleId: schMath.id,
      studentId: studentProfile1.id,
      theoryMarks: 76,
      practicalMarks: 19,
      graceMarks: 0,
      remarks: 'Outstanding analytical clarity in Geometry',
    },
  });

  await prisma.examMarkEntry.create({
    data: {
      examScheduleId: schScience.id,
      studentId: studentProfile1.id,
      theoryMarks: 72,
      practicalMarks: 20,
      graceMarks: 0,
      remarks: 'Excellent performance in Optics and Electricity',
    },
  });

  // 13. Timetable Entries
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const day of days) {
    await prisma.timetableEntry.create({
      data: {
        academicYearId: academicYear.id,
        sectionId: sec10A.id,
        subjectId: subMath.id,
        teacherId: teacherMath.id,
        dayOfWeek: day,
        periodIndex: 1,
        startTime: '08:30',
        endTime: '09:15',
        roomNumber: 'Room 1001',
      },
    });

    await prisma.timetableEntry.create({
      data: {
        academicYearId: academicYear.id,
        sectionId: sec10A.id,
        subjectId: subScience.id,
        teacherId: teacherScience.id,
        dayOfWeek: day,
        periodIndex: 2,
        startTime: '09:15',
        endTime: '10:00',
        roomNumber: 'Science Lab 1',
      },
    });
  }

  // 14. Homework
  const hw1 = await prisma.homework.create({
    data: {
      classId: class10.id,
      sectionId: sec10A.id,
      subjectId: subMath.id,
      title: 'Chapter 8: Trigonometric Identities Exercise 8.4',
      description: 'Solve Q1 to Q5 from NCERT textbook with complete step-by-step LHS = RHS proofs.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxMarks: 20,
    },
  });

  await prisma.homeworkSubmission.create({
    data: {
      homeworkId: hw1.id,
      studentId: studentProfile1.id,
      submissionText: 'All 5 identity proofs solved in assignment notebook and verified.',
      marksAwarded: 19,
      feedback: 'Very clean step-by-step simplification!',
      status: 'GRADED',
    },
  });

  // 15. Library Books & Issue
  const book1 = await prisma.libraryBook.create({
    data: {
      title: 'Concepts of Physics - Volume 1',
      author: 'Dr. H.C. Verma',
      isbn: '978-8177091878',
      category: 'Science & Physics',
      rackNumber: 'RACK-04',
      totalCopies: 8,
      availableCopies: 7,
      price: 495,
    },
  });

  const book2 = await prisma.libraryBook.create({
    data: {
      title: 'NCERT Exemplar Problems - Mathematics Class 10',
      author: 'NCERT Editorial Board',
      isbn: '978-9350071427',
      category: 'Mathematics',
      rackNumber: 'RACK-02',
      totalCopies: 12,
      availableCopies: 11,
      price: 280,
    },
  });

  await prisma.bookIssueRecord.create({
    data: {
      bookId: book1.id,
      studentId: studentProfile1.id,
      issueDate: new Date('2025-09-01'),
      dueDate: new Date('2025-09-21'),
      status: 'ISSUED',
    },
  });

  // 16. Transport (Vehicle, Route, Stop, Assignment)
  const bus1 = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'UP16-BT-4421',
      model: 'Tata Starbus Ultra (40-Seater)',
      seatingCapacity: 40,
      driverStaffId: transportStaff.id,
      gpsDeviceId: 'GPS-EDV-4421',
    },
  });

  const route1 = await prisma.route.create({
    data: {
      routeName: 'Route 1 - Express Sector 62 to Expressway 128',
      startPoint: 'Edvonest Campus Sector 62',
      endPoint: 'Jaypee Wish Town Sector 128',
      totalDistanceKm: 18.5,
      vehicleId: bus1.id,
    },
  });

  const stop1 = await prisma.routeStop.create({
    data: {
      routeId: route1.id,
      stopName: 'Sector 50 Community Centre Gate',
      stopOrder: 3,
      pickupTime: '07:25 AM',
      dropTime: '02:40 PM',
      monthlyFee: 1800,
    },
  });

  await prisma.studentTransportAssignment.create({
    data: {
      studentId: studentProfile1.id,
      routeId: route1.id,
      stopId: stop1.id,
      isActive: true,
    },
  });

  // 17. HR: Leave Requests & Salary Slips
  await prisma.leaveRequest.create({
    data: {
      teacherId: teacherMath.id,
      leaveType: 'CASUAL',
      startDate: new Date('2025-10-05'),
      endDate: new Date('2025-10-06'),
      daysCount: 2,
      reason: 'Attending National CBSE Mathematics Teachers Pedagogy Conclave in Delhi',
      status: 'APPROVED',
      approvedBy: 'Dr. Sunita Mehra (PRINCIPAL)',
    },
  });

  await prisma.staffSalarySlip.create({
    data: {
      slipNumber: 'PAY-2025-08-0112',
      teacherId: teacherMath.id,
      month: 'August 2025',
      basicSalary: 58000,
      allowances: 6500,
      deductions: 2500,
      netSalary: 62000,
      status: 'PAID',
    },
  });

  // 18. Announcements & Events
  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: 'CBSE Class 10 Board Registration & LOC Verification Schedule',
      content: 'All parents of Class 10 students are requested to verify the spelling of names, DOB, and chosen language options in the candidate list by Friday.',
      targetAudience: 'PARENTS',
      priority: 'HIGH',
      authorName: 'Rajesh Sharma (School Admin)',
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: 'Inter-School Science & Robotics Innovation Exhibition 2025',
      content: 'Edvonest Academy is hosting the annual inter-school ATL tinkers science conclave. Students are invited to register working models with Dr. Sen.',
      targetAudience: 'ALL',
      priority: 'NORMAL',
      authorName: 'Dr. Sunita Mehra (Principal)',
    },
  });

  await prisma.schoolEvent.create({
    data: {
      title: 'Annual Sports Day & Athletics Meet 2025',
      description: 'Track and field events, inter-house tug-of-war, and march-past display.',
      startDate: new Date('2025-11-20'),
      venue: 'Main Sports Complex & Athletics Track',
      schoolId: school.id,
    },
  });

  // 19. Certificate Templates & Issued Certificate
  const certTemplate = await prisma.certificateTemplate.create({
    data: {
      name: 'Bonafide Student Certificate',
      type: 'BONAFIDE',
      bodyTemplate: 'This is to certify that {studentName}, ward of {parentName}, is a bonafide student of Class {className}.',
    },
  });

  await prisma.issuedCertificate.create({
    data: {
      certificateNo: 'EDV-CERT-2025-081',
      templateId: certTemplate.id,
      studentId: studentProfile1.id,
      certificateType: 'BONAFIDE',
      purpose: 'Passport & Visa Application Support',
      generatedBy: 'Rajesh Sharma (Admin)',
      issueDate: new Date('2025-08-15'),
    },
  });

  // 20. CMS Pages
  await prisma.cmsPage.create({
    data: {
      slug: 'about-us',
      title: 'About Edvonest Model International Academy',
      content: 'Edvonest Model International Academy is committed to academic excellence, innovative pedagogy, and holistic student development.',
      schoolId: school.id,
    },
  });

  // 21. Audit Log Initial Entry
  await prisma.auditLog.create({
    data: {
      schoolId: school.id,
      userId: userAdmin.id,
      action: 'SYSTEM_SEED',
      module: 'SYSTEM',
      newValue: 'Initial system seed and demo data setup completed successfully.',
    },
  });

  // -------------------------------------------------------------
  // 22. MODULES A & D: CHAPTERS, SYLLABUS & LESSON PLANS
  // -------------------------------------------------------------
  const chMath1 = await prisma.chapter.create({
    data: {
      subjectId: subMath.id,
      name: 'Chapter 1: Real Numbers',
      chapterNumber: 1,
      totalPeriods: 8,
      isCompleted: true,
      completedAt: new Date('2025-05-10'),
    },
  });
  const chMath2 = await prisma.chapter.create({
    data: {
      subjectId: subMath.id,
      name: 'Chapter 2: Polynomials',
      chapterNumber: 2,
      totalPeriods: 10,
      isCompleted: true,
      completedAt: new Date('2025-06-15'),
    },
  });
  const chMath8 = await prisma.chapter.create({
    data: {
      subjectId: subMath.id,
      name: 'Chapter 8: Introduction to Trigonometry',
      chapterNumber: 8,
      totalPeriods: 14,
      isCompleted: false,
    },
  });

  const chSci1 = await prisma.chapter.create({
    data: {
      subjectId: subScience.id,
      name: 'Chapter 10: Light - Reflection and Refraction',
      chapterNumber: 10,
      totalPeriods: 12,
      isCompleted: true,
      completedAt: new Date('2025-08-20'),
    },
  });
  const chSci2 = await prisma.chapter.create({
    data: {
      subjectId: subScience.id,
      name: 'Chapter 12: Electricity & Ohm\'s Law',
      chapterNumber: 12,
      totalPeriods: 14,
      isCompleted: false,
    },
  });

  await prisma.lessonPlan.create({
    data: {
      teacherId: teacherMath.id,
      classId: class10.id,
      sectionId: sec10A.id,
      subjectId: subMath.id,
      chapterId: chMath8.id,
      topicTitle: 'Proof of Fundamental Trigonometric Identities: sin²θ + cos²θ = 1',
      learningObjectives: 'Students will algebraically derive pythagorean trigonometric identities and apply them to prove RHS=LHS textbook equations.',
      teachingMethod: 'Geometrical proof on smartboard followed by paired problem solving.',
      materialsNeeded: 'NCERT Textbook, Geometry Instruments, Geogebra Simulation',
      scheduledDate: new Date(),
      completionStatus: 'IN_PROGRESS',
      status: 'APPROVED',
      principalRemarks: 'Well-structured pedagogy and interactive demonstration plan.',
      approvedById: userPrincipal.id,
    },
  });

  await prisma.lessonPlan.create({
    data: {
      teacherId: teacherScience.id,
      classId: class10.id,
      sectionId: sec10A.id,
      subjectId: subScience.id,
      chapterId: chSci2.id,
      topicTitle: 'Series and Parallel Resistor Circuits Experimentation',
      learningObjectives: 'Hands-on verification of equivalent resistance formulas using breadboards and multimeters.',
      teachingMethod: 'Laboratory demonstration and guided group experimentation.',
      materialsNeeded: 'Resistors, DC Battery Packs, Digital Multimeters, Connecting Wires',
      scheduledDate: new Date(Date.now() + 86400000),
      completionStatus: 'PLANNED',
      status: 'SUBMITTED',
    },
  });

  // -------------------------------------------------------------
  // 23. MODULE A: ACADEMIC ALERTS & RISK PREDICTION
  // -------------------------------------------------------------
  await prisma.academicAlert.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: subMath.id,
      alertType: 'NEEDS_IMPROVEMENT',
      metricName: 'Trigonometry Homework Accuracy',
      currentValue: '68%',
      thresholdValue: '75%',
      reason: 'Struggled with multi-step identity conversions in recent mock worksheet.',
      recommendedAction: 'Assign personalized adaptive practice questions on Chapter 8 and schedule 15-min remedial doubt session.',
      status: 'OPEN',
    },
  });

  // -------------------------------------------------------------
  // 24. MODULE B: PERSONALIZED LEARNING PATHS & REVISION
  // -------------------------------------------------------------
  await prisma.learningPath.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: subMath.id,
      targetGoal: 'Master Class 10 CBSE Board Exemplar Questions with 95%+ Target',
      currentMastery: 84.5,
      recommendedTopicsJson: JSON.stringify([
        'Heights and Distances 3D Problems',
        'Quadratic Equations Word Problems',
        'Surface Areas and Volumes Combinations',
      ]),
      status: 'ACTIVE',
    },
  });

  await prisma.revisionSchedule.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: subMath.id,
      topicName: 'Trigonometric Ratios of Complementary Angles',
      revisionDate: new Date(Date.now() + 2 * 86400000),
      priority: 'HIGH',
      isCompleted: false,
    },
  });

  await prisma.revisionSchedule.create({
    data: {
      studentId: studentProfile1.id,
      subjectId: subScience.id,
      topicName: 'Concave & Convex Mirror Ray Diagrams & Sign Conventions',
      revisionDate: new Date(Date.now() + 4 * 86400000),
      priority: 'NORMAL',
      isCompleted: false,
    },
  });

  // -------------------------------------------------------------
  // 25. MODULE C: QUESTION BANK & MOCK TEST
  // -------------------------------------------------------------
  const q1 = await prisma.question.create({
    data: {
      subjectId: subMath.id,
      chapterId: chMath8.id,
      questionType: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 1,
      questionText: 'If sin θ + cos θ = √2 cos θ, then what is the value of cos θ - sin θ?',
      explanation: 'Square both sides and use identity sin²θ + cos²θ = 1. Result equals √2 sin θ.',
      sampleAnswer: 'Option B: √2 sin θ',
      isApproved: true,
      options: {
        create: [
          { optionKey: 'A', optionText: '√2 cos θ', isCorrect: false },
          { optionKey: 'B', optionText: '√2 sin θ', isCorrect: true },
          { optionKey: 'C', optionText: '2 sin θ', isCorrect: false },
          { optionKey: 'D', optionText: 'sin θ', isCorrect: false },
        ],
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      subjectId: subMath.id,
      chapterId: chMath8.id,
      questionType: 'SHORT',
      difficulty: 'HARD',
      marks: 3,
      questionText: 'Prove that (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A.',
      explanation: 'Expand both brackets, use sin²A + cos²A = 1, cosec²A = 1 + cot²A, sec²A = 1 + tan²A and 2sinA·cosecA = 2.',
      sampleAnswer: 'LHS expansion gives (sin²A + cos²A) + (cosec²A + sec²A) + 4 = 1 + (1+cot²A) + (1+tan²A) + 4 = 7 + tan²A + cot²A = RHS. Hence proved.',
      isApproved: true,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      subjectId: subScience.id,
      chapterId: chSci1.id,
      questionType: 'MCQ',
      difficulty: 'EASY',
      marks: 1,
      questionText: 'Which mirror is commonly used as a rear-view mirror in automobiles?',
      explanation: 'Convex mirrors always give an erect though diminished image and provide a wider field of view.',
      sampleAnswer: 'Convex mirror',
      isApproved: true,
      options: {
        create: [
          { optionKey: 'A', optionText: 'Concave mirror', isCorrect: false },
          { optionKey: 'B', optionText: 'Convex mirror', isCorrect: true },
          { optionKey: 'C', optionText: 'Plane mirror', isCorrect: false },
          { optionKey: 'D', optionText: 'Inverted mirror', isCorrect: false },
        ],
      },
    },
  });

  const qPaper1 = await prisma.questionPaper.create({
    data: {
      title: 'CBSE Class 10 Mid-Term Standard Mathematics Blueprint 2025-26',
      subjectId: subMath.id,
      classId: class10.id,
      totalMarks: 80,
      durationMinutes: 180,
      instructions: '1. Paper contains 38 questions in 5 Sections A-E.\n2. Section A has 20 MCQs of 1 mark each.\n3. Section B has 5 Short Answer questions of 2 marks each.',
      blueprintJson: JSON.stringify({
        mcqCount: 20,
        shortCount: 5,
        longCount: 6,
        caseStudyCount: 3,
        difficultyRatio: { easy: '30%', medium: '50%', hard: '20%' },
      }),
      isApproved: true,
      approvedById: userPrincipal.id,
    },
  });

  const mockTest1 = await prisma.mockTest.create({
    data: {
      title: 'Class 10 Weekly Speed Test: Trigonometry & Real Numbers',
      subjectId: subMath.id,
      classId: class10.id,
      totalMarks: 25,
      durationMinutes: 40,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() + 86400000),
      isPublished: true,
    },
  });

  await prisma.mockTestSubmission.create({
    data: {
      mockTestId: mockTest1.id,
      studentId: studentProfile1.id,
      totalScore: 23,
      answersJson: JSON.stringify({ q1: 'B', scoreBreakdown: { sectionA: 10, sectionB: 13 } }),
    },
  });

  // -------------------------------------------------------------
  // 26. MODULE E: CAMPUS SAFETY, GATE PASS & INCIDENTS
  // -------------------------------------------------------------
  await prisma.gateLog.create({
    data: {
      personType: 'STUDENT',
      personId: userStudent1.id,
      personName: 'Aarav Verma',
      identifierCard: 'EDV-2023-0101',
      entryTime: new Date(new Date().setHours(7, 52, 0, 0)),
      gateNumber: 'Gate 1 (Main Pedestrian Turnstile)',
      verifiedBy: 'Security Officer Raghunath',
      status: 'INSIDE',
    },
  });

  await prisma.gateLog.create({
    data: {
      personType: 'STAFF',
      personId: userTeacherMath.id,
      personName: 'Vikram Verma',
      identifierCard: 'TCH-MAT-101',
      entryTime: new Date(new Date().setHours(7, 45, 0, 0)),
      gateNumber: 'Gate 2 (Faculty RFID Barrier)',
      verifiedBy: 'Security Officer Raghunath',
      status: 'INSIDE',
    },
  });

  await prisma.authorizedPickup.create({
    data: {
      studentId: studentProfile1.id,
      guardianName: 'Amit Verma',
      relationship: 'Father',
      phone: '+91 98666 88990',
      idProofType: 'Aadhaar Card (UIDAI Verified)',
      isApproved: true,
    },
  });

  await prisma.authorizedPickup.create({
    data: {
      studentId: studentProfile1.id,
      guardianName: 'Sunita Verma',
      relationship: 'Mother',
      phone: '+91 98666 88991',
      idProofType: 'Passport Verified',
      isApproved: true,
    },
  });

  await prisma.visitorPass.create({
    data: {
      passNumber: 'VP-2025-1108',
      visitorName: 'Prof. K. N. Rao',
      phone: '+91 98199 44321',
      purpose: 'CBSE Science Exhibition Guest Judge Briefing',
      hostStaffName: 'Dr. Sunita Mehra (Principal)',
      checkInTime: new Date(new Date().setHours(9, 15, 0, 0)),
      status: 'ACTIVE',
      badgeQr: 'VP-2025-1108-VERIFIED',
    },
  });

  await prisma.safetyIncident.create({
    data: {
      title: 'Minor Slip during Football Practice (Wet Turf)',
      severity: 'LOW',
      category: 'PLAYGROUND',
      description: 'Student suffered minor knee abrasion near football goalpost. First aid spray and sterile bandage applied at Health Centre.',
      location: 'Primary Sports Ground',
      reportedById: userTeacherScience.id,
      status: 'RESOLVED',
      resolutionNotes: 'Treated with antiseptic and ice pack. Student returned to class comfortably.',
    },
  });

  // -------------------------------------------------------------
  // 27. MODULE F: LIVE BUS TRIP LOGS & FLEET MAINTENANCE
  // -------------------------------------------------------------
  await prisma.busTripLog.create({
    data: {
      vehicleId: bus1.id,
      routeId: route1.id,
      tripType: 'MORNING_PICKUP',
      driverName: 'Harpal Singh',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      currentLat: 28.6280,
      currentLng: 77.3649,
      currentSpeedKm: 34.2,
      status: 'COMPLETED',
      deviationAlert: false,
      etaMinutes: 0,
    },
  });

  await prisma.vehicleMaintenance.create({
    data: {
      vehicleId: bus1.id,
      maintenanceType: 'FITNESS_CERT',
      scheduledDate: new Date('2025-10-15'),
      completedDate: new Date('2025-10-14'),
      cost: 4200,
      vendorName: 'Noida RTO Authorized Inspection Centre',
      status: 'COMPLETED',
    },
  });

  await prisma.vehicleMaintenance.create({
    data: {
      vehicleId: bus1.id,
      maintenanceType: 'SERVICE',
      scheduledDate: new Date(Date.now() + 15 * 86400000),
      cost: 8500,
      vendorName: 'Tata Motors Commercial Fleet Service',
      status: 'PENDING',
    },
  });

  // -------------------------------------------------------------
  // 28. MODULE G: HEALTH CLINIC & MEDICAL PROFILES
  // -------------------------------------------------------------
  await prisma.studentHealthProfile.create({
    data: {
      studentId: studentProfile1.id,
      bloodGroup: 'B+',
      heightCm: 168.5,
      weightKg: 56.2,
      visionLeft: '6/6',
      visionRight: '6/6',
      allergies: 'None recorded',
      chronicConditions: 'None',
      emergencyMedicalNotes: 'Fully vaccinated. Carries inhaler for mild cold-induced wheezing (rare).',
      lastCheckupDate: new Date('2025-07-20'),
    },
  });

  await prisma.clinicVisit.create({
    data: {
      studentId: studentProfile1.id,
      visitDate: new Date('2025-09-04'),
      symptoms: 'Mild headache and eye strain during computer practical session.',
      treatmentGiven: 'Rest in infirmary for 30 minutes, hydration and paracetamol administered with parent consent.',
      medicineAdministered: 'Paracetamol 500mg, Oral Rehydration Salt',
      referredToHospital: false,
      attendedByNurse: 'Nurse Preeti (Campus Health Centre)',
    },
  });

  await prisma.healthCheckupSchedule.create({
    data: {
      title: 'Annual Comprehensive Paediatric & Dental Health Screening 2025',
      targetClassId: class10.id,
      scheduledDate: new Date(Date.now() + 12 * 86400000),
      doctorName: 'Dr. R. K. Singhal (Apollo Clinic Visiting Team)',
      checkupType: 'Dental, Vision, Audiometry & General BMI',
      status: 'SCHEDULED',
    },
  });

  // -------------------------------------------------------------
  // 29. MODULE H: ADMISSION CRM EXTENSIONS
  // -------------------------------------------------------------
  const admApp = await prisma.admissionApplication.create({
    data: {
      applicationNo: 'ADM-2026-8812',
      studentName: 'Vihaan Saxena',
      gender: 'MALE',
      dob: new Date('2011-04-12'),
      applyingForClass: 'Class 9',
      parentName: 'Col. Manish Saxena',
      parentEmail: 'manish.saxena@outlook.com',
      parentPhone: '+91 98188 77665',
      address: 'Army Officers Enclave, Sector 37, Noida',
      status: 'UNDER_REVIEW',
      interviewDate: new Date(Date.now() + 5 * 86400000),
      interviewNotes: 'Father transferred from Pune command. Excellent previous ICSE academic record.',
    },
  });

  await prisma.admissionDocument.create({
    data: {
      applicationId: admApp.id,
      documentType: 'TRANSFER_CERTIFICATE',
      fileUrl: '/uploads/documents/adm_8812_tc.pdf',
      status: 'VERIFIED',
      verifiedBy: 'Rajesh Sharma (Admin)',
      notes: 'Countersigned by District Education Officer Pune.',
    },
  });

  await prisma.admissionDocument.create({
    data: {
      applicationId: admApp.id,
      documentType: 'REPORT_CARD',
      fileUrl: '/uploads/documents/adm_8812_marksheet.pdf',
      status: 'VERIFIED',
      verifiedBy: 'Rajesh Sharma (Admin)',
      notes: 'Overall A1 Grade (94.2%) in Class 8.',
    },
  });

  await prisma.admissionInterview.create({
    data: {
      applicationId: admApp.id,
      scheduledAt: new Date(Date.now() + 5 * 86400000),
      interviewerName: 'Dr. Sunita Mehra (Principal) & HOD Science',
      outcome: 'RECOMMENDED',
      feedback: 'Very confident, sharp logical aptitude and active sportsman.',
    },
  });

  // -------------------------------------------------------------
  // 30. MODULE I: STUDENT DIGITAL PORTFOLIO & ACHIEVEMENTS
  // -------------------------------------------------------------
  await prisma.studentAchievement.create({
    data: {
      studentId: studentProfile1.id,
      title: 'State Mathematics Olympiad Gold Medalist (Uttar Pradesh)',
      category: 'OLYMPIAD',
      achievementDate: new Date('2025-08-18'),
      rankOrPosition: 'State Rank 1 (Gold Medal)',
      issuingAuthority: 'National Council of Mathematics Olympiad',
      certificateUrl: '/certificates/olympiad_gold_aarav.pdf',
      isVerified: true,
      verifiedByStaff: 'Vikram Verma (HOD Math)',
    },
  });

  await prisma.studentAchievement.create({
    data: {
      studentId: studentProfile1.id,
      title: 'Captain - Under-16 Inter-House Football Champions',
      category: 'SPORTS',
      achievementDate: new Date('2025-07-29'),
      rankOrPosition: 'Champions Trophy Winner',
      issuingAuthority: 'Edvonest Annual Sports Board',
      isVerified: true,
      verifiedByStaff: 'Coach Balwant Singh (Physical Education Director)',
    },
  });

  await prisma.studentAchievement.create({
    data: {
      studentId: studentProfile1.id,
      title: 'Organized Community Tree Plantation Drive (250 Saplings Planted)',
      category: 'COMMUNITY',
      achievementDate: new Date('2025-06-05'),
      rankOrPosition: 'Youth Green Ambassador',
      issuingAuthority: 'Noida Green City Council & Eco Club',
      isVerified: true,
    },
  });

  // -------------------------------------------------------------
  // 31. MODULE J: PARENT ENGAGEMENT (PTM & DIGITAL CONSENTS)
  // -------------------------------------------------------------
  await prisma.ptmBooking.create({
    data: {
      parentId: parentProfile1.id,
      teacherId: teacherMath.id,
      scheduledDate: new Date(Date.now() + 7 * 86400000),
      timeSlot: '11:20 AM - 11:40 AM',
      meetingMode: 'IN_PERSON',
      notes: 'Review Board Exam revision trajectory and optional NTSE preparation guidance.',
      status: 'CONFIRMED',
    },
  });

  await prisma.digitalConsent.create({
    data: {
      parentId: parentProfile1.id,
      studentId: studentProfile1.id,
      title: 'Educational Field Trip to National Science Centre, New Delhi',
      description: 'One-day educational bus trip including Planetarium show, 3D science gallery, and innovation lab visit on Saturday.',
      deadline: new Date(Date.now() + 3 * 86400000),
      isAccepted: true,
      signedAt: new Date(),
    },
  });

  // -------------------------------------------------------------
  // 32. MODULE K: INVENTORY & ASSET MANAGEMENT
  // -------------------------------------------------------------
  const catIT = await prisma.assetCategory.create({
    data: { name: 'IT Infrastructure & Computers', code: 'IT_COMP' },
  });
  const catLabEq = await prisma.assetCategory.create({
    data: { name: 'Composite Science Laboratory', code: 'LAB_SCI' },
  });
  const catFurn = await prisma.assetCategory.create({
    data: { name: 'Classroom Ergonomic Furniture', code: 'FURN' },
  });

  const vendor1 = await prisma.assetVendor.create({
    data: {
      name: 'Dell Technologies Commercial Partner Ltd.',
      contactPerson: 'Sanjay Aggarwal',
      phone: '+91 11 4100 2200',
      email: 'enterprise@dell-noida.in',
      address: 'Plot 4, Sector 18, Noida',
      gstNumber: '07AAACD1234K1Z5',
    },
  });

  const asset1 = await prisma.assetItem.create({
    data: {
      assetCode: 'AST-IT-2025-042',
      name: 'Dell OptiPlex 7010 Intel Core i7 Desktop (Lab 1)',
      categoryId: catIT.id,
      location: 'Computer Laboratory 1 - Block B',
      purchaseDate: new Date('2025-04-15'),
      purchaseCost: 58000,
      currentQuantity: 30,
      minStockThreshold: 5,
      condition: 'EXCELLENT',
      isConsumable: false,
    },
  });

  const asset2 = await prisma.assetItem.create({
    data: {
      assetCode: 'AST-SCI-2025-108',
      name: 'Olympus Binocular Biological Compound Microscope (1000x)',
      categoryId: catLabEq.id,
      location: 'Senior Biology Lab - Block A',
      purchaseDate: new Date('2025-05-10'),
      purchaseCost: 22500,
      currentQuantity: 18,
      minStockThreshold: 3,
      condition: 'EXCELLENT',
      isConsumable: false,
    },
  });

  await prisma.assetIssueRecord.create({
    data: {
      assetId: asset2.id,
      issuedToUserId: userTeacherScience.id,
      issuedDate: new Date('2025-09-01'),
      returnDueDate: new Date('2025-09-30'),
      quantity: 1,
      conditionReturn: 'In perfect calibration for optics project',
    },
  });

  await prisma.purchaseRequest.create({
    data: {
      itemTitle: 'Robotics Microcontroller Kits (Arduino & Raspberry Pi Sensors)',
      categoryName: 'IT & Innovation Lab',
      quantity: 15,
      estimatedCost: 37500,
      requestedByUserId: userTeacherScience.id,
      reason: 'ATL Tinkering Lab Inter-School Innovation Competition preparation.',
      status: 'APPROVED',
      approvedByUserId: userAdmin.id,
    },
  });

  // -------------------------------------------------------------
  // 33. MODULE L: STAFF ATTENDANCE, SUBSTITUTIONS & APPRAISALS
  // -------------------------------------------------------------
  await prisma.staffAttendanceRecord.create({
    data: {
      teacherProfileId: teacherMath.id,
      date: new Date(),
      status: 'PRESENT',
      checkInTime: '07:48 AM',
      checkOutTime: '03:30 PM',
    },
  });

  await prisma.staffAttendanceRecord.create({
    data: {
      teacherProfileId: teacherScience.id,
      date: new Date(),
      status: 'PRESENT',
      checkInTime: '07:52 AM',
      checkOutTime: '03:30 PM',
    },
  });

  await prisma.substituteAssignment.create({
    data: {
      absentTeacherId: teacherScience.id,
      substituteTeacherId: teacherMath.id,
      sectionId: sec10B.id,
      periodIndex: 4,
      date: new Date(Date.now() - 86400000),
      status: 'COMPLETED',
    },
  });

  await prisma.staffAppraisal.create({
    data: {
      teacherProfileId: teacherMath.id,
      appraisalYear: '2024-2025',
      teachingQualityScore: 4.8,
      studentFeedbackScore: 4.9,
      administrativeScore: 4.6,
      finalRating: 'OUTSTANDING',
      reviewRemarks: '100% CBSE board distinction rate in Class 10 Mathematics. Exceptionally patient with remedial learners.',
      reviewedByStaff: 'Dr. Sunita Mehra (Principal)',
    },
  });

  // -------------------------------------------------------------
  // 34. MODULE O: EVENTS PARTICIPATION & GALLERY
  // -------------------------------------------------------------
  const sportsEvent = await prisma.schoolEvent.findFirst();
  if (sportsEvent) {
    await prisma.eventRegistration.create({
      data: {
        eventId: sportsEvent.id,
        studentId: studentProfile1.id,
        roleOrCategory: '400m Track Relay & High Jump',
        participationStatus: 'WINNER',
        parentConsentGiven: true,
      },
    });

    await prisma.eventGalleryItem.create({
      data: {
        eventId: sportsEvent.id,
        mediaUrl: '/gallery/sports_day_flag_hoisting.jpg',
        caption: 'Principal Dr. Sunita Mehra lighting the ceremonial Olympic Torch.',
        mediaType: 'IMAGE',
      },
    });
  }

  // -------------------------------------------------------------
  // 35. MODULE P: MULTI-CAMPUS BRANCHES
  // -------------------------------------------------------------
  await prisma.campusBranch.create({
    data: {
      schoolId: school.id,
      name: 'Edvonest Main Senior Campus (Sector 62)',
      branchCode: 'EDV-NOIDA-01',
      address: 'Plot 12, Institutional Area, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      principalName: 'Dr. Sunita Mehra',
      contactPhone: '+91 11 4982 3000',
      studentCapacity: 2400,
      isActive: true,
    },
  });

  await prisma.campusBranch.create({
    data: {
      schoolId: school.id,
      name: 'Edvonest Expressway Junior Wing (Sector 128)',
      branchCode: 'EDV-EXPR-02',
      address: 'Block C, Jaypee Greens Wish Town',
      city: 'Noida',
      state: 'Uttar Pradesh',
      principalName: 'Mrs. Radhika Kapoor',
      contactPhone: '+91 120 488 9100',
      studentCapacity: 1200,
      isActive: true,
    },
  });

  await prisma.campusBranch.create({
    data: {
      schoolId: school.id,
      name: 'Edvonest International Heritage Campus (Greater Noida)',
      branchCode: 'EDV-GRN-03',
      address: 'Knowledge Park III, Institutional Zone',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      principalName: 'Dr. Anand K. Varma',
      contactPhone: '+91 120 232 5500',
      studentCapacity: 3000,
      isActive: true,
    },
  });

  // -------------------------------------------------------------
  // 36. NOTIFICATION TEMPLATES
  // -------------------------------------------------------------
  await prisma.notificationTemplate.create({
    data: {
      templateKey: 'STUDENT_ABSENCE_ALERT',
      titleTemplate: 'Absence Notice: {{studentName}} ({{date}})',
      bodyTemplate: 'Dear Parent, your ward {{studentName}} has been marked absent today on {{date}}. If unwell, please submit a leave application via EdvoNest Parent Portal.',
      defaultChannel: 'WHATSAPP',
    },
  });

  await prisma.notificationTemplate.create({
    data: {
      templateKey: 'FEE_PAYMENT_DUE',
      titleTemplate: 'Upcoming Fee Invoice Reminder: {{invoiceNumber}}',
      bodyTemplate: 'Dear Parent, school fee invoice {{invoiceNumber}} for amount ₹{{amount}} is due on {{dueDate}}. Pay instantly through UPI or NetBanking on EdvoNest.',
      defaultChannel: 'SMS',
    },
  });

  await prisma.notificationTemplate.create({
    data: {
      templateKey: 'BUS_BOARDING_NOTICE',
      titleTemplate: 'Transport Alert: {{studentName}} Boarded Bus #{{busNumber}}',
      bodyTemplate: 'Your child has successfully boarded School Bus #{{busNumber}} at {{stopName}} at {{time}}. Estimated school arrival: {{eta}}.',
      defaultChannel: 'IN_APP',
    },
  });

  await prisma.notificationDeliveryLog.create({
    data: {
      userId: userParent1.id,
      notificationType: 'ATTENDANCE',
      channel: 'WHATSAPP',
      recipientAddress: '+91 98666 88990',
      messageBody: 'Aarav Verma has entered school premises safely through Gate 1 at 07:52 AM.',
      status: 'DELIVERED',
    },
  });

  console.log('✅ EDVONEST Next-Gen Database seeded successfully with all new modules (A through P)!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
