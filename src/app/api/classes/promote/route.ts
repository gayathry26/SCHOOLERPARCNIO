import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/classes/promote
 * Handles bulk student promotion to the next academic year, class, and section.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      sourceSectionId,
      targetClassId,
      targetSectionId,
      targetAcademicYearId,
      studentIds = [],
      status = 'PROMOTED', // PROMOTED, CONDITIONAL
      remarks,
    } = body;

    if (!sourceSectionId || !targetClassId || !targetSectionId || !targetAcademicYearId) {
      return NextResponse.json(
        {
          error:
            'sourceSectionId, targetClassId, targetSectionId, and targetAcademicYearId are all required for student promotion.',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one student to promote.' },
        { status: 400 }
      );
    }

    // Validate source section
    const sourceSection = await prisma.section.findUnique({
      where: { id: sourceSectionId },
      include: { class: true },
    });
    if (!sourceSection) {
      return NextResponse.json({ error: 'Source section not found' }, { status: 404 });
    }

    // Validate target section and class
    const targetSection = await prisma.section.findUnique({
      where: { id: targetSectionId },
      include: {
        class: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!targetSection) {
      return NextResponse.json({ error: 'Target section not found' }, { status: 404 });
    }

    // Capacity verification
    const currentEnrollment = targetSection._count.enrollments;
    const availableSeats = Math.max(0, targetSection.capacity - currentEnrollment);
    if (studentIds.length > availableSeats) {
      return NextResponse.json(
        {
          error: `Capacity exceeded: Target section has ${availableSeats} seat(s) available (${currentEnrollment}/${targetSection.capacity}), but you are promoting ${studentIds.length} student(s). Increase section capacity first.`,
        },
        { status: 400 }
      );
    }

    // Source academic year
    let sourceYearId = sourceSection.class.academicYearId;
    if (!sourceYearId) {
      const activeYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      sourceYearId = activeYear?.id || targetAcademicYearId;
    }

    let promotedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const studentId of studentIds) {
        // 1. Mark existing enrollment as PROMOTED
        await tx.studentEnrollment.updateMany({
          where: {
            studentId,
            sectionId: sourceSectionId,
            status: 'ACTIVE',
          },
          data: {
            status: 'PROMOTED',
            promotedToYearId: targetAcademicYearId,
            promotedToClassId: targetClassId,
          },
        });

        // 2. Create new enrollment in target year/class/section
        await tx.studentEnrollment.create({
          data: {
            studentId,
            academicYearId: targetAcademicYearId,
            classId: targetClassId,
            sectionId: targetSectionId,
            status: 'ACTIVE',
          },
        });

        // 3. Record in StudentPromotionLog
        await tx.studentPromotionLog.create({
          data: {
            studentId,
            fromYearId: sourceYearId!,
            toYearId: targetAcademicYearId,
            fromClassId: sourceSection.classId,
            toClassId: targetClassId,
            fromSectionId: sourceSectionId,
            toSectionId: targetSectionId,
            status,
            eligibilityNotes: remarks || `Promoted by ${user.firstName} ${user.lastName}`,
            processedById: user.id,
          },
        });

        promotedCount++;
      }
    });

    return NextResponse.json({
      message: `Successfully promoted ${promotedCount} student(s) from ${sourceSection.class.name}-${sourceSection.name} to ${targetSection.class.name}-${targetSection.name}.`,
      promotedCount,
    });
  } catch (error: any) {
    console.error('Error promoting students:', error);
    return NextResponse.json({ error: error.message || 'Failed to promote students' }, { status: 500 });
  }
}
