import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { verifySectionAccess, getTeacherAuthorizedSections } from '@/lib/classAdvisorGuard';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const status = searchParams.get('status') || 'ACTIVE';

    // If teacher, resolve their authorized sections
    let teacherSectionIds: string[] | null = null;
    if (user.role === 'TEACHER') {
      const authSections = await getTeacherAuthorizedSections(user.id);
      teacherSectionIds = authSections.allSectionIds;

      // If querying a specific section, check access
      if (sectionId && !teacherSectionIds.includes(sectionId)) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view students in this class section.' },
          { status: 403 }
        );
      }
    }

    const whereClause: any = {
      isArchived: status === 'ARCHIVED',
    };

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true },
        },
        parents: { include: { parent: { include: { user: true } } } },
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
        if (!classId && !sectionId) return true;
        if (classId && currentEnrollment?.classId !== classId) return false;
        if (sectionId && currentEnrollment?.sectionId !== sectionId) return false;
        return true;
      })
      .map((s) => ({
        id: s.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber || s.enrollments[0]?.rollNumber || '-',
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        gender: s.gender,
        bloodGroup: s.bloodGroup || '-',
        className: s.enrollments[0]?.class?.name || 'Unassigned',
        sectionName: s.enrollments[0]?.section?.name || '-',
        classId: s.enrollments[0]?.classId,
        sectionId: s.enrollments[0]?.sectionId,
        parentName: s.parents[0]?.parent?.user
          ? `${s.parents[0].parent.user.firstName} ${s.parents[0].parent.user.lastName}`
          : 'Parent Info On File',
        parentPhone: s.parents[0]?.parent?.phone || s.emergencyContact,
        house: s.house || 'General',
        city: s.city,
        isArchived: s.isArchived,
      }));

    return NextResponse.json({ students: formatted });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'RECEPTIONIST', 'TEACHER'];
    if (!ALLOWED_STAFF.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized administrative staff and class advisors can enroll students.' },
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
      rollNumber,
      parentName,
      parentPhone,
      parentEmail,
      house,
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
    if (!currentYear) return NextResponse.json({ error: 'No active academic year found' }, { status: 400 });

    const defaultPassword = await hashPassword('password123');
    const admissionNo = `EDV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
        phone: emergencyContact,
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
        emergencyContact: emergencyContact || parentPhone || '+91 98000 00000',
        house: house || 'Emerald',
      },
    });

    // 3. Resolve Class & Section (supports ID or Name from Quick Actions)
    let targetClassId = classId;
    let targetSectionId = sectionId;

    if (!targetClassId && body.className) {
      const cls = await prisma.class.findFirst({
        where: {
          name: body.className,
          isActive: true,
        },
        include: { sections: { where: { isActive: true }, orderBy: { name: 'asc' } } },
      });
      if (cls) {
        targetClassId = cls.id;
        // Section allocation is only assigned if admin or if sectionName provided by admin
        if (!targetSectionId && (user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN')) {
          if (body.sectionName) {
            const sec = cls.sections.find((s) => s.name === body.sectionName);
            if (sec) targetSectionId = sec.id;
          }
          if (!targetSectionId && cls.sections[0]) {
            targetSectionId = cls.sections[0].id;
          }
        }
      }
    }

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
    if (parentName) {
      const pEmail = parentEmail || `parent.${admissionNo.toLowerCase()}@edvonest.com`;
      let pUser = await prisma.user.findUnique({ where: { email: pEmail } });
      if (!pUser) {
        const [pFirst, ...pRest] = parentName.split(' ');
        pUser = await prisma.user.create({
          data: {
            schoolId: user.schoolId,
            email: pEmail,
            username: `parent.${admissionNo.toLowerCase()}`,
            passwordHash: defaultPassword,
            role: 'PARENT',
            firstName: pFirst || 'Parent',
            lastName: pRest.join(' ') || 'Guardian',
            phone: parentPhone || emergencyContact,
          },
        });
      }

      let pProfile = await prisma.parentProfile.findUnique({ where: { userId: pUser.id } });
      if (!pProfile) {
        pProfile = await prisma.parentProfile.create({
          data: {
            userId: pUser.id,
            phone: parentPhone || emergencyContact || '+91 98000 00000',
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
      newValue: `Created student ${firstName} ${lastName} (Adm #${admissionNo}) in Class & Section`,
    });

    return NextResponse.json({ success: true, student: studentProfile });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/students
 * Admin-only: Allocate or update a student's section and enrollment.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { studentId, sectionId, classId, rollNumber, isArchived } = body;

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

    if (sectionId || classId) {
      const activeEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (activeEnrollment) {
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

    if (rollNumber !== undefined || isArchived !== undefined) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          rollNumber: rollNumber !== undefined ? rollNumber : undefined,
          isArchived: isArchived !== undefined ? isArchived : undefined,
        },
      });
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_STUDENT_SECTION_ALLOCATION',
      module: 'STUDENTS',
      recordId: studentId,
      newValue: `Updated section allocation to ${sectionId} for student ${studentId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating student section allocation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
