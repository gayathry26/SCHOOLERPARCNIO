import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/students/lifecycle
 * Orchestrates complete student lifecycle actions:
 * - SECTION_TRANSFER
 * - GENERATE_TC
 * - ALUMNI_GRADUATION
 * - WITHDRAWAL
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only School Administrators and Principals can perform lifecycle operations.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, studentId } = body;

    if (!studentId || !action) {
      return NextResponse.json({ error: 'studentId and action are required.' }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, section: true, academicYear: true },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const activeEnrollment = student.enrollments[0];

    // ==========================================
    // ACTION 1: SECTION TRANSFER
    // ==========================================
    if (action === 'SECTION_TRANSFER') {
      const { targetSectionId, reason } = body;
      if (!targetSectionId) {
        return NextResponse.json({ error: 'targetSectionId is required for section transfer.' }, { status: 400 });
      }

      if (activeEnrollment && activeEnrollment.sectionId === targetSectionId) {
        return NextResponse.json({ error: 'Student is already in this section.' }, { status: 400 });
      }

      // Check target section capacity
      const targetSec = await prisma.section.findUnique({
        where: { id: targetSectionId },
        include: {
          class: true,
          _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
        },
      });

      if (!targetSec) {
        return NextResponse.json({ error: 'Target section not found.' }, { status: 404 });
      }

      if (targetSec._count.enrollments >= targetSec.capacity) {
        return NextResponse.json(
          {
            error: `Target section ${targetSec.class.name} - Section ${targetSec.name} is at maximum capacity (${targetSec.capacity} students).`,
          },
          { status: 400 }
        );
      }

      // 1. Create Section Transfer Log
      if (activeEnrollment) {
        await prisma.sectionTransferLog.create({
          data: {
            studentId,
            academicYearId: activeEnrollment.academicYearId,
            fromSectionId: activeEnrollment.sectionId,
            toSectionId: targetSectionId,
            reason: reason || 'Administrative Section Reallocation',
            transferredById: user.id,
          },
        });

        // 2. Update active enrollment
        await prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: { sectionId: targetSectionId },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'STUDENT_SECTION_TRANSFER',
        module: 'STUDENTS',
        recordId: studentId,
        newValue: `Transferred student ${student.admissionNumber} to section ${targetSec.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully transferred student to Section ${targetSec.name}`,
      });
    }

    // ==========================================
    // ACTION 2: GENERATE TRANSFER CERTIFICATE (TC)
    // ==========================================
    if (action === 'GENERATE_TC') {
      const { reasonForLeaving, conduct, duesCleared, remarks } = body;

      if (!reasonForLeaving) {
        return NextResponse.json({ error: 'Reason for leaving is required to issue a Transfer Certificate.' }, { status: 400 });
      }

      const yearString = new Date().getFullYear().toString();
      const tcNumber = `TC/${yearString}/${Math.floor(1000 + Math.random() * 9000)}`;
      const studentName = `${student.user.firstName} ${student.user.lastName}`;
      const className = activeEnrollment?.class?.name || 'Class 10';
      const academicYear = activeEnrollment?.academicYear?.name || '2026-2027';

      // 1. Create official TC record
      const tcRecord = await prisma.transferCertificateRecord.create({
        data: {
          tcNumber,
          studentId,
          bookNumber: `TC-${yearString}/B1`,
          admissionNumber: student.admissionNumber,
          studentName,
          classLeaving: className,
          academicYear,
          leavingDate: new Date(),
          reasonForLeaving,
          conduct: conduct || 'EXCELLENT',
          duesCleared: duesCleared !== undefined ? duesCleared : true,
          attendanceRate: 94.2,
          issuedById: user.id,
          issuedAt: new Date(),
          status: 'ISSUED',
          remarks: remarks || 'All school property and library books returned.',
        },
      });

      // 2. Update Student Profile Lifecycle to TC_ISSUED
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          lifecycleStage: 'TC_ISSUED',
          tcNumber,
          tcDate: new Date(),
          leavingReason: reasonForLeaving,
          isArchived: true,
          archivedReason: `Transfer Certificate Issued: ${tcNumber}`,
        },
      });

      // 3. Mark current enrollment as TC_ISSUED
      if (activeEnrollment) {
        await prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: { status: 'TC_ISSUED' },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ISSUE_TRANSFER_CERTIFICATE',
        module: 'STUDENTS',
        recordId: studentId,
        newValue: `Issued TC #${tcNumber} to student ${studentName}`,
      });

      return NextResponse.json({
        success: true,
        tc: tcRecord,
        message: `Official Transfer Certificate #${tcNumber} issued successfully.`,
      });
    }

    // ==========================================
    // ACTION 3: ALUMNI GRADUATION
    // ==========================================
    if (action === 'ALUMNI_GRADUATION') {
      const { graduationYear, finalClass, passingMarksPercent, conduct, currentPursuit } = body;

      const gradYear = graduationYear || new Date().getFullYear().toString();

      const alumni = await prisma.alumniRecord.upsert({
        where: { studentId },
        update: {
          graduationYear: gradYear,
          finalClass: finalClass || activeEnrollment?.class?.name || 'Class 12',
          passingMarksPercent: passingMarksPercent || 88.5,
          conduct: conduct || 'EXCELLENT',
          currentPursuit: currentPursuit || 'Higher Studies',
        },
        create: {
          studentId,
          graduationYear: gradYear,
          finalClass: finalClass || activeEnrollment?.class?.name || 'Class 12',
          passingMarksPercent: passingMarksPercent || 88.5,
          conduct: conduct || 'EXCELLENT',
          currentPursuit: currentPursuit || 'Higher Studies',
        },
      });

      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          lifecycleStage: 'ALUMNI',
          isArchived: false,
        },
      });

      if (activeEnrollment) {
        await prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: { status: 'GRADUATED' },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'GRADUATE_TO_ALUMNI',
        module: 'STUDENTS',
        recordId: studentId,
        newValue: `Student graduated to Alumni class of ${gradYear}`,
      });

      return NextResponse.json({ success: true, alumni });
    }

    // ==========================================
    // ACTION 4: WITHDRAWAL
    // ==========================================
    if (action === 'WITHDRAW') {
      const { reason } = body;
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          lifecycleStage: 'WITHDRAWN',
          isArchived: true,
          archivedReason: reason || 'Voluntary Student Withdrawal',
        },
      });

      if (activeEnrollment) {
        await prisma.studentEnrollment.update({
          where: { id: activeEnrollment.id },
          data: { status: 'WITHDRAWN' },
        });
      }

      return NextResponse.json({ success: true, message: 'Student withdrawn successfully.' });
    }

    return NextResponse.json({ error: 'Unknown lifecycle action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling student lifecycle action:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
