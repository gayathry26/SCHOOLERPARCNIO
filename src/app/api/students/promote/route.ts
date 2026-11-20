import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can promote students.' }, { status: 403 });
    }

    const { studentIds, targetAcademicYearId, targetClassId, targetSectionId, action } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'No students selected' }, { status: 400 });
    }

    if (action === 'PROMOTE') {
      if (!targetAcademicYearId || !targetClassId || !targetSectionId) {
        return NextResponse.json({ error: 'Target academic year, class, and section required for promotion' }, { status: 400 });
      }

      for (const studentId of studentIds) {
        // 1. Mark existing active enrollment as PROMOTED
        await prisma.studentEnrollment.updateMany({
          where: { studentId, status: 'ACTIVE' },
          data: {
            status: 'PROMOTED',
            promotedToYearId: targetAcademicYearId,
            promotedToClassId: targetClassId,
          },
        });

        // 2. Create new enrollment in the target year and class
        await prisma.studentEnrollment.create({
          data: {
            studentId,
            academicYearId: targetAcademicYearId,
            classId: targetClassId,
            sectionId: targetSectionId,
            status: 'ACTIVE',
          },
        });
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'BULK_STUDENT_PROMOTION',
        module: 'STUDENTS',
        newValue: `Promoted ${studentIds.length} students to new academic year/class`,
      });
    } else if (action === 'ARCHIVE') {
      for (const studentId of studentIds) {
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: { isArchived: true, archivedReason: 'Administrative Archive / Transfer' },
        });
      }
    }

    return NextResponse.json({ success: true, count: studentIds.length });
  } catch (error: any) {
    console.error('Error in student promotion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
