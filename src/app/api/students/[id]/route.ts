import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getTeacherAuthorizedSections } from '@/lib/classAdvisorGuard';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // RBAC: Check access to this specific student
    if (user.role === 'STUDENT') {
      const self = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (self?.id !== id) {
        return NextResponse.json({ error: 'Forbidden: You can only view your own profile.' }, { status: 403 });
      }
    } else if (user.role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const isChild = parent?.students.some((s) => s.studentId === id);
      if (!isChild) {
        return NextResponse.json({ error: 'Forbidden: You can only view your child profile.' }, { status: 403 });
      }
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: {
          include: { class: true, section: true, academicYear: true },
          orderBy: { createdAt: 'desc' },
        },
        parents: {
          include: { parent: { include: { user: true } } },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        transferCertificates: {
          orderBy: { createdAt: 'desc' },
        },
        promotionLogs: {
          orderBy: { createdAt: 'desc' },
        },
        sectionTransfers: {
          orderBy: { transferredAt: 'desc' },
        },
        alumniRecord: true,
        healthProfile: true,
        attendance: {
          take: 60,
          orderBy: { date: 'desc' },
        },
        invoices: {
          include: { payments: true },
          orderBy: { dueDate: 'desc' },
        },
        markEntries: {
          include: {
            examSchedule: { include: { subject: true, exam: true } },
          },
        },
        submissions: {
          include: { homework: { include: { subject: true } } },
          orderBy: { submittedDate: 'desc' },
        },
        achievements: {
          orderBy: { achievementDate: 'desc' },
        },
        clinicVisits: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Teacher check
    if (user.role === 'TEACHER') {
      const auth = await getTeacherAuthorizedSections(user.id);
      const currentEnrollment = student.enrollments[0];
      if (currentEnrollment && !auth.allSectionIds.includes(currentEnrollment.sectionId)) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view students outside your assigned sections.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // If teacher, verify class advisor status for student's section
    if (user.role === 'TEACHER') {
      const student = await prisma.studentProfile.findUnique({
        where: { id },
        include: { enrollments: { where: { status: 'ACTIVE' }, take: 1 } },
      });
      const activeSectionId = student?.enrollments[0]?.sectionId;
      const auth = await getTeacherAuthorizedSections(user.id);
      const isAdvisor = auth.advisorSections.some((s: any) => s.id === activeSectionId);
      if (!isAdvisor) {
        return NextResponse.json(
          { error: 'Forbidden: Only the assigned Class Advisor can update student details.' },
          { status: 403 }
        );
      }
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      bloodGroup,
      house,
      rollNumber,
      emergencyContact,
      address,
      city,
      state,
      pincode,
      previousSchool,
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

    // Update StudentProfile
    const profileUpdate: any = {};
    if (dob) profileUpdate.dob = new Date(dob);
    if (gender) profileUpdate.gender = gender;
    if (bloodGroup !== undefined) profileUpdate.bloodGroup = bloodGroup;
    if (house !== undefined) profileUpdate.house = house;
    if (rollNumber !== undefined) profileUpdate.rollNumber = rollNumber;
    if (emergencyContact !== undefined) profileUpdate.emergencyContact = emergencyContact;
    if (address !== undefined) profileUpdate.address = address;
    if (city !== undefined) profileUpdate.city = city;
    if (state !== undefined) profileUpdate.state = state;
    if (pincode !== undefined) profileUpdate.pincode = pincode;
    if (previousSchool !== undefined) profileUpdate.previousSchool = previousSchool;

    if (fatherName !== undefined) profileUpdate.fatherName = fatherName;
    if (fatherPhone !== undefined) profileUpdate.fatherPhone = fatherPhone;
    if (fatherEmail !== undefined) profileUpdate.fatherEmail = fatherEmail;
    if (fatherOccupation !== undefined) profileUpdate.fatherOccupation = fatherOccupation;
    if (motherName !== undefined) profileUpdate.motherName = motherName;
    if (motherPhone !== undefined) profileUpdate.motherPhone = motherPhone;
    if (motherEmail !== undefined) profileUpdate.motherEmail = motherEmail;
    if (motherOccupation !== undefined) profileUpdate.motherOccupation = motherOccupation;
    if (guardianName !== undefined) profileUpdate.guardianName = guardianName;
    if (guardianPhone !== undefined) profileUpdate.guardianPhone = guardianPhone;
    if (guardianEmail !== undefined) profileUpdate.guardianEmail = guardianEmail;
    if (guardianRelation !== undefined) profileUpdate.guardianRelation = guardianRelation;
    if (guardianOccupation !== undefined) profileUpdate.guardianOccupation = guardianOccupation;

    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: profileUpdate,
      include: { user: true },
    });

    // Update User if name/email changed
    if (firstName || lastName || email || phone) {
      await prisma.user.update({
        where: { id: updatedProfile.userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
          phone: phone || emergencyContact || undefined,
        },
      });
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_STUDENT_PROFILE',
      module: 'STUDENTS',
      recordId: id,
      newValue: `Updated student ${id} comprehensive profile details`,
    });

    return NextResponse.json({ success: true, student: updatedProfile });
  } catch (error: any) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only School Administrators can archive students.' }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await req.json().catch(() => ({ reason: 'Administrative withdrawal' }));

    await prisma.studentProfile.update({
      where: { id },
      data: {
        isArchived: true,
        archivedReason: reason || 'Withdrawn by Administrator',
        lifecycleStage: 'WITHDRAWN',
      },
    });

    // Mark active enrollment as WITHDRAWN
    await prisma.studentEnrollment.updateMany({
      where: { studentId: id, status: 'ACTIVE' },
      data: { status: 'WITHDRAWN' },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'WITHDRAW_STUDENT',
      module: 'STUDENTS',
      recordId: id,
      newValue: `Archived/Withdrew student ${id} with reason: ${reason}`,
    });

    return NextResponse.json({ success: true, message: 'Student archived successfully.' });
  } catch (error: any) {
    console.error('Error archiving student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
