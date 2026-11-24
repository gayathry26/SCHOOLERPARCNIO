import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getTeacherAuthorizedSections } from '@/lib/classAdvisorGuard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/students
 * Retrieves students with multi-filter and strict role-based access control.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const academicYearId = searchParams.get('academicYearId');
    const status = searchParams.get('status') || 'ACTIVE'; // ACTIVE, ARCHIVED, PROMOTED, TC_ISSUED, ALUMNI, ALL
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    // Role-specific filtering
    let parentStudentIds: string[] | null = null;
    let selfStudentId: string | null = null;
    let teacherSectionIds: string[] | null = null;

    if (user.role === 'PARENT') {
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      parentStudentIds = parentProfile?.students.map((m) => m.studentId) || [];
    } else if (user.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      selfStudentId = studentProfile?.id || '__NONE__';
    } else if (user.role === 'TEACHER') {
      const authSections = await getTeacherAuthorizedSections(user.id);
      teacherSectionIds = authSections.allSectionIds;

      // If querying a specific section outside authorization
      if (sectionId && !teacherSectionIds.includes(sectionId)) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view students in this class section.' },
          { status: 403 }
        );
      }
    }

    // Build base where clause
    const whereClause: any = {};

    if (selfStudentId) {
      whereClause.id = selfStudentId;
    } else if (parentStudentIds !== null) {
      whereClause.id = { in: parentStudentIds };
    }

    if (status === 'ARCHIVED') {
      whereClause.isArchived = true;
    } else if (status === 'TC_ISSUED') {
      whereClause.lifecycleStage = 'TC_ISSUED';
    } else if (status === 'ALUMNI') {
      whereClause.lifecycleStage = 'ALUMNI';
    } else if (status === 'PROMOTED') {
      whereClause.lifecycleStage = 'PROMOTED';
    } else if (status === 'ACTIVE') {
      whereClause.isArchived = false;
      whereClause.lifecycleStage = { in: ['ACTIVE_ENROLLMENT', 'ENQUIRY', 'APPLICATION', 'ADMISSION'] };
    }

    // Academic Year filter on enrollments
    const enrollmentWhere: any = {};
    if (academicYearId) {
      enrollmentWhere.academicYearId = academicYearId;
    } else {
      enrollmentWhere.academicYear = { isCurrent: true };
    }
    if (status === 'ACTIVE') {
      enrollmentWhere.status = 'ACTIVE';
    }

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        enrollments: {
          where: enrollmentWhere,
          include: { class: true, section: true, academicYear: true },
          orderBy: { createdAt: 'desc' },
        },
        parents: { include: { parent: { include: { user: true } } } },
        documents: { select: { id: true, documentType: true, status: true } },
        transferCertificates: { select: { id: true, tcNumber: true, status: true, issuedAt: true } },
        transportAssign: { include: { route: true, stop: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = students
      .filter((s) => {
        const currentEnrollment = s.enrollments[0];

        // Enforce teacher section boundary
        if (teacherSectionIds && currentEnrollment) {
          if (!teacherSectionIds.includes(currentEnrollment.sectionId)) {
            return false;
          }
        }

        if (classId && currentEnrollment?.classId !== classId) return false;
        if (sectionId && currentEnrollment?.sectionId !== sectionId) return false;

        // Search filter
        if (search) {
          const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
          const admNo = s.admissionNumber.toLowerCase();
          const roll = (s.rollNumber || s.enrollments[0]?.rollNumber || '').toLowerCase();
          const email = (s.user.email || '').toLowerCase();
          if (
            !fullName.includes(search) &&
            !admNo.includes(search) &&
            !roll.includes(search) &&
            !email.includes(search)
          ) {
            return false;
          }
        }

        return true;
      })
      .map((s) => ({
        id: s.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber || s.enrollments[0]?.rollNumber || '-',
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        gender: s.gender,
        dob: s.dob.toISOString().split('T')[0],
        bloodGroup: s.bloodGroup || '-',
        className: s.enrollments[0]?.class?.name || 'Unassigned',
        sectionName: s.enrollments[0]?.section?.name || '-',
        classId: s.enrollments[0]?.classId,
        sectionId: s.enrollments[0]?.sectionId,
        academicYearName: s.enrollments[0]?.academicYear?.name || 'Current Year',
        parentName:
          s.fatherName ||
          (s.parents[0]?.parent?.user
            ? `${s.parents[0].parent.user.firstName} ${s.parents[0].parent.user.lastName}`
            : 'Guardian On File'),
        parentPhone: s.fatherPhone || s.parents[0]?.parent?.phone || s.emergencyContact || '-',
        fatherName: s.fatherName,
        fatherPhone: s.fatherPhone,
        motherName: s.motherName,
        motherPhone: s.motherPhone,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        address: s.address,
        city: s.city,
        state: s.state,
        pincode: s.pincode,
        house: s.house || 'General',
        lifecycleStage: s.lifecycleStage,
        isArchived: s.isArchived,
        tcNumber: s.tcNumber || s.transferCertificates[0]?.tcNumber || null,
        documentsCount: s.documents.length,
        verifiedDocsCount: s.documents.filter((d) => d.status === 'VERIFIED').length,
        admissionDate: s.admissionDate.toISOString().split('T')[0],
      }));

    return NextResponse.json({
      students: formatted,
      totalCount: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/students
 * Registers a new student with section capacity check, parent linking, and audit logging.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST'];
    if (!ALLOWED_STAFF.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized administrative staff can enroll students.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      gender,
      dob,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      emergencyContact,
      classId,
      sectionId,
      className,
      sectionName,
      rollNumber,
      admissionDate,
      previousSchool,
      house,
      // Parent details
      parentName,
      parentPhone,
      parentEmail,
      fatherName,
      fatherPhone,
      fatherEmail,
      fatherOccupation,
      motherName,
      motherPhone,
      motherEmail,
      motherOccupation,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelation,
      guardianOccupation,
    } = body;

    // Strict Rule: Section allocation is restricted exclusively to School Administrator
    if (sectionId && user.role !== 'SCHOOL_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Section allocation is restricted exclusively to School Administrators.' },
        { status: 403 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });
    if (!currentYear) return NextResponse.json({ error: 'No active academic year found in the system' }, { status: 400 });

    // Resolve target class and section
    let targetClassId = classId;
    let targetSectionId = sectionId;

    if (!targetClassId && className) {
      const cls = await prisma.class.findFirst({
        where: { name: className, isActive: true },
        include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' } } },
      });
      if (cls) {
        targetClassId = cls.id;
        if (!targetSectionId && (user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN')) {
          if (sectionName) {
            const sec = cls.sections.find((s) => s.name === sectionName);
            if (sec) targetSectionId = sec.id;
          }
          if (!targetSectionId && cls.sections[0]) {
            targetSectionId = cls.sections[0].id;
          }
        }
      }
    }

    // Validate section capacity availability if section is selected
    if (targetSectionId) {
      const targetSec = await prisma.section.findUnique({
        where: { id: targetSectionId },
        include: {
          class: true,
          _count: {
            select: { enrollments: { where: { status: 'ACTIVE', academicYearId: currentYear.id } } },
          },
        },
      });

      if (targetSec) {
        if (targetSec._count.enrollments >= targetSec.capacity) {
          return NextResponse.json(
            {
              error: `Section ${targetSec.class.name} - ${targetSec.name} has reached maximum capacity (${targetSec.capacity} students). Please allocate another section.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const defaultPassword = await hashPassword('password123');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const admissionNo = `EDV-${new Date().getFullYear()}-${randomSuffix}`;

    // 1. Create Student User Account
    const studentUser = await prisma.user.create({
      data: {
        schoolId: user.schoolId,
        email: email || `student.${admissionNo.toLowerCase()}@edvonest.com`,
        username: admissionNo.toLowerCase(),
        passwordHash: defaultPassword,
        role: 'STUDENT',
        firstName,
        lastName,
        phone: emergencyContact || fatherPhone || parentPhone,
      },
    });

    // 2. Create Student Profile
    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        admissionNumber: admissionNo,
        rollNumber: rollNumber || 'TBD',
        dob: new Date(dob || '2012-01-01'),
        gender: gender || 'MALE',
        bloodGroup: bloodGroup || 'O+',
        address: address || 'School Neighborhood',
        city: city || 'Noida',
        state: state || 'Uttar Pradesh',
        pincode: pincode || '201301',
        emergencyContact: emergencyContact || fatherPhone || parentPhone || '+91 98000 00000',
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        previousSchool: previousSchool || null,
        house: house || 'Ruby',
        lifecycleStage: 'ACTIVE_ENROLLMENT',
        // Parent details
        fatherName: fatherName || parentName || null,
        fatherPhone: fatherPhone || parentPhone || null,
        fatherEmail: fatherEmail || parentEmail || null,
        fatherOccupation: fatherOccupation || null,
        motherName: motherName || null,
        motherPhone: motherPhone || null,
        motherEmail: motherEmail || null,
        motherOccupation: motherOccupation || null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        guardianEmail: guardianEmail || null,
        guardianRelation: guardianRelation || null,
        guardianOccupation: guardianOccupation || null,
      },
    });

    // 3. Create Student Enrollment in Current Academic Year
    if (targetClassId) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: studentProfile.id,
          academicYearId: currentYear.id,
          classId: targetClassId,
          sectionId: targetSectionId || null,
          rollNumber: rollNumber || 'TBD',
          status: 'ACTIVE',
        },
      });
    }

    // 4. Create or Link Parent Account
    const resolvedParentName = fatherName || parentName;
    const resolvedParentPhone = fatherPhone || parentPhone || emergencyContact;
    const resolvedParentEmail =
      fatherEmail || parentEmail || `parent.${admissionNo.toLowerCase()}@edvonest.com`;

    if (resolvedParentName) {
      let pUser = await prisma.user.findUnique({ where: { email: resolvedParentEmail } });
      if (!pUser) {
        const [pFirst, ...pRest] = resolvedParentName.split(' ');
        pUser = await prisma.user.create({
          data: {
            schoolId: user.schoolId,
            email: resolvedParentEmail,
            username: `parent.${admissionNo.toLowerCase()}`,
            passwordHash: defaultPassword,
            role: 'PARENT',
            firstName: pFirst || 'Parent',
            lastName: pRest.join(' ') || 'Guardian',
            phone: resolvedParentPhone,
          },
        });
      }

      let pProfile = await prisma.parentProfile.findUnique({ where: { userId: pUser.id } });
      if (!pProfile) {
        pProfile = await prisma.parentProfile.create({
          data: {
            userId: pUser.id,
            relation: fatherName ? 'Father' : guardianRelation || 'Guardian',
            occupation: fatherOccupation || guardianOccupation || 'Professional',
            phone: resolvedParentPhone || '+91 98000 00000',
            address: address || 'School Neighborhood',
          },
        });
      }

      await prisma.studentParentMap.create({
        data: {
          studentId: studentProfile.id,
          parentId: pProfile.id,
          isPrimary: true,
        },
      });
    }

    // 5. Audit Log
    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'CREATE_STUDENT_ENROLLMENT',
      module: 'STUDENTS',
      recordId: studentProfile.id,
      newValue: `Enrolled student ${firstName} ${lastName} (Adm #${admissionNo}) in Class/Section`,
    });

    return NextResponse.json({
      success: true,
      student: {
        ...studentProfile,
        admissionNumber: admissionNo,
      },
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/students
 * Updates student profile, section allocation, or status.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      studentId,
      sectionId,
      classId,
      rollNumber,
      isArchived,
      lifecycleStage,
      bloodGroup,
      house,
      emergencyContact,
      address,
      city,
      state,
      pincode,
      fatherName,
      fatherPhone,
      fatherEmail,
      fatherOccupation,
      motherName,
      motherPhone,
      motherEmail,
      motherOccupation,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelation,
      guardianOccupation,
      previousSchool,
    } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    // Strict Rule: Section allocation can ONLY be performed by School Admin / Super Admin
    if (sectionId && user.role !== 'SCHOOL_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Section allocation is restricted exclusively to School Administrators.' },
        { status: 403 }
      );
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    // Check capacity if updating section
    if (sectionId && (user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN')) {
      const targetSec = await prisma.section.findUnique({
        where: { id: sectionId },
        include: {
          class: true,
          _count: {
            select: { enrollments: { where: { status: 'ACTIVE', academicYearId: currentYear?.id } } },
          },
        },
      });

      if (targetSec && targetSec._count.enrollments >= targetSec.capacity) {
        return NextResponse.json(
          {
            error: `Section ${targetSec.class.name} - ${targetSec.name} is at maximum capacity (${targetSec.capacity} students).`,
          },
          { status: 400 }
        );
      }
    }

    if (sectionId || classId) {
      const activeEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (activeEnrollment) {
        // If section is changing, log section transfer
        if (sectionId && sectionId !== activeEnrollment.sectionId && currentYear) {
          await prisma.sectionTransferLog.create({
            data: {
              studentId,
              academicYearId: currentYear.id,
              fromSectionId: activeEnrollment.sectionId,
              toSectionId: sectionId,
              reason: 'Administrative Section Reallocation',
              transferredById: user.id,
            },
          });
        }

        await prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: {
            classId: classId || activeEnrollment.classId,
            sectionId: sectionId || activeEnrollment.sectionId,
            rollNumber: rollNumber !== undefined ? rollNumber : activeEnrollment.rollNumber,
          },
        });
      } else if (currentYear && classId && sectionId) {
        await prisma.studentEnrollment.create({
          data: {
            studentId,
            academicYearId: currentYear.id,
            classId,
            sectionId,
            rollNumber: rollNumber || '-',
            status: 'ACTIVE',
          },
        });
      }
    }

    // Update Profile fields
    const updateData: any = {};
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (lifecycleStage !== undefined) updateData.lifecycleStage = lifecycleStage;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (house !== undefined) updateData.house = house;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (previousSchool !== undefined) updateData.previousSchool = previousSchool;

    // Parent details
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (fatherPhone !== undefined) updateData.fatherPhone = fatherPhone;
    if (fatherEmail !== undefined) updateData.fatherEmail = fatherEmail;
    if (fatherOccupation !== undefined) updateData.fatherOccupation = fatherOccupation;
    if (motherName !== undefined) updateData.motherName = motherName;
    if (motherPhone !== undefined) updateData.motherPhone = motherPhone;
    if (motherEmail !== undefined) updateData.motherEmail = motherEmail;
    if (motherOccupation !== undefined) updateData.motherOccupation = motherOccupation;
    if (guardianName !== undefined) updateData.guardianName = guardianName;
    if (guardianPhone !== undefined) updateData.guardianPhone = guardianPhone;
    if (guardianEmail !== undefined) updateData.guardianEmail = guardianEmail;
    if (guardianRelation !== undefined) updateData.guardianRelation = guardianRelation;
    if (guardianOccupation !== undefined) updateData.guardianOccupation = guardianOccupation;

    if (Object.keys(updateData).length > 0) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: updateData,
      });
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_STUDENT_PROFILE',
      module: 'STUDENTS',
      recordId: studentId,
      newValue: `Updated student ${studentId} records`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
