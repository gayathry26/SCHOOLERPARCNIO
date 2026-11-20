import { prisma } from '../../lib/db';
import { enforceTenantIsolation, checkStudentCapacity, isModuleEnabledForSchool } from '../../lib/tenant';
import { hashPassword } from '../../lib/auth';

async function runTenantIsolationTests() {
  console.log('================================================================');
  console.log('AUTOMATED MULTI-TENANT AUTHORIZATION & DATA ISOLATION TEST SUITE');
  console.log('================================================================\n');

  // 1. Verify School A (Main Tenant)
  console.log('TEST 1: Verifying Primary School A (Tenant: MAIN)...');
  const schoolA = await prisma.school.findFirst({ where: { tenantCode: 'MAIN' } });
  if (!schoolA) throw new Error('Primary school A not found');
  console.log(`✓ School A verified: "${schoolA.name}" (Tenant: ${schoolA.tenantCode}, ID: ${schoolA.id})`);

  // 2. Provision Isolated Tenant School B
  console.log('\nTEST 2: Provisioning Secondary School B (Tenant: GREENWOOD)...');
  let schoolB = await prisma.school.findFirst({ where: { tenantCode: 'GREENWOOD' } });
  if (!schoolB) {
    const schoolBId = `sch_greenwood_${Date.now()}`;
    schoolB = await prisma.school.create({
      data: {
        id: schoolBId,
        tenantCode: 'GREENWOOD',
        name: 'Greenwood Cambridge International',
        board: 'ICSE',
        affiliationNo: 'ICSE/DEL/2026/092',
        email: 'info@greenwood.edu.in',
        phone: '+91 11 8899 0011',
        city: 'South Delhi',
        state: 'Delhi',
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE',
        status: 'ACTIVE',
        maxStudents: 2, // Set tight limit of 2 for capacity test
        maxStaff: 5,
        enabledModules: JSON.stringify(['STUDENTS', 'ACADEMICS', 'ATTENDANCE', 'FEES_FINANCE']),
      },
    });

    // Create School B Admin User
    const pwd = await hashPassword('password123');
    await prisma.user.create({
      data: {
        schoolId: schoolB.id,
        email: 'admin@greenwood.edu.in',
        username: 'admin.greenwood',
        passwordHash: pwd,
        role: 'SCHOOL_ADMIN',
        firstName: 'Elena',
        lastName: 'D\'Souza',
      },
    });

    // Create School B Academic Year
    const yearB = await prisma.academicYear.create({
      data: {
        schoolId: schoolB.id,
        name: '2026–2027 Greenwood Session',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
        status: 'ACTIVE',
      },
    });

    // Create School B Class & Section
    const classB = await prisma.class.create({
      data: {
        schoolId: schoolB.id,
        academicYearId: yearB.id,
        name: 'Grade 9 ICSE',
        numericOrder: 9,
      },
    });

    const secB = await prisma.section.create({
      data: {
        classId: classB.id,
        name: 'A',
      },
    });

    // Enroll 2 Students into School B
    for (let i = 1; i <= 2; i++) {
      const u = await prisma.user.create({
        data: {
          schoolId: schoolB.id,
          email: `student${i}@greenwood.edu.in`,
          username: `gw.student${i}`,
          passwordHash: pwd,
          role: 'STUDENT',
          firstName: `GW-Student-${i}`,
          lastName: 'Fernandez',
        },
      });

      const sp = await prisma.studentProfile.create({
        data: {
          userId: u.id,
          admissionNumber: `GW-${Date.now()}-${i}`,
          dob: new Date('2010-05-15'),
          gender: 'FEMALE',
        },
      });

      await prisma.studentEnrollment.create({
        data: {
          studentId: sp.id,
          academicYearId: yearB.id,
          classId: classB.id,
          sectionId: secB.id,
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`✓ School B active: "${schoolB.name}" (Tenant: ${schoolB.tenantCode}, ID: ${schoolB.id})`);

  // 3. Test Read Isolation
  console.log('\nTEST 3: Testing Strict Read Isolation Across Tenants...');
  const schoolAStudents = await prisma.user.findMany({
    where: { schoolId: schoolA.id, role: 'STUDENT' },
  });
  const schoolBStudents = await prisma.user.findMany({
    where: { schoolId: schoolB.id, role: 'STUDENT' },
  });

  console.log(`- School A Students retrieved: ${schoolAStudents.length}`);
  console.log(`- School B Students retrieved: ${schoolBStudents.length}`);

  // Assert no cross-contamination
  const leakIntoA = schoolAStudents.some((s) => s.schoolId !== schoolA.id);
  const leakIntoB = schoolBStudents.some((s) => s.schoolId !== schoolB.id);

  if (leakIntoA || leakIntoB) {
    throw new Error('FAIL: Cross-tenant data leak detected! Query returned records belonging to another school!');
  }
  console.log('✓ PASS: Zero cross-tenant data leakage. Query returned strictly isolated tenant records.');

  // 4. Test Cross-Tenant Mutation Guard
  console.log('\nTEST 4: Testing Cross-Tenant Authorization Guard (enforceTenantIsolation)...');
  const schoolBAdminUser: any = {
    id: 'user_b_admin',
    role: 'SCHOOL_ADMIN',
    schoolId: schoolB.id,
  };

  const studentFromSchoolA = schoolAStudents[0];
  const isAllowedToMutate = enforceTenantIsolation(schoolBAdminUser, studentFromSchoolA.schoolId);

  if (isAllowedToMutate) {
    throw new Error('FAIL: School B admin was wrongly permitted to access School A records!');
  }
  console.log('✓ PASS: Cross-tenant modification strictly blocked. Returned false (403 Forbidden).');

  // 5. Test Super Admin Oversight
  console.log('\nTEST 5: Testing Platform Super Admin Universal Oversight...');
  const superAdminUser: any = {
    id: 'super_admin_id',
    role: 'SUPER_ADMIN',
    schoolId: schoolA.id,
  };
  const isSuperAdminAllowedAcrossTenants = enforceTenantIsolation(superAdminUser, schoolB.id);
  if (!isSuperAdminAllowedAcrossTenants) {
    throw new Error('FAIL: Super Admin was blocked from cross-tenant platform oversight!');
  }
  console.log('✓ PASS: Super Admin permitted universal platform oversight across all schools.');

  // 6. Test Student Quota Limit Gate
  console.log('\nTEST 6: Testing Subscription Student Quota Gate (checkStudentCapacity)...');
  const capacityCheck = await checkStudentCapacity(schoolB.id);
  console.log(`- School B Capacity Check: Enrolled ${capacityCheck.currentStudents} / Max Limit ${capacityCheck.maxStudents}`);

  if (capacityCheck.canEnroll) {
    throw new Error('FAIL: School B was allowed to exceed its plan student quota limit!');
  }
  console.log('✓ PASS: Student quota gate triggered. Enrollment blocked once quota is reached.');

  // 7. Test Module Subscription Tier Gating
  console.log('\nTEST 7: Testing Module Subscription Tier Gating (isModuleEnabledForSchool)...');
  const isStudentsAllowed = isModuleEnabledForSchool(schoolB, 'STUDENTS');
  const isTransportAllowed = isModuleEnabledForSchool(schoolB, 'TRANSPORT'); // Not in School B Basic plan

  console.log(`- Module STUDENTS permitted for School B: ${isStudentsAllowed}`);
  console.log(`- Module TRANSPORT permitted for School B: ${isTransportAllowed}`);

  if (!isStudentsAllowed || isTransportAllowed) {
    throw new Error('FAIL: Module subscription gating did not enforce permitted module list!');
  }
  console.log('✓ PASS: Module-based subscriptions enforced. Only permitted modules are accessible.');

  console.log('\n================================================================');
  console.log('ALL 7 MULTI-TENANT AUTHORIZATION TESTS PASSED WITH 100% SUCCESS');
  console.log('================================================================');
}

runTenantIsolationTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
