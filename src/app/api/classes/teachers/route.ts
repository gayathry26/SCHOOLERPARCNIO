import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/classes/teachers
 * Returns subject teacher allocations across classes and sections.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const allocations = await prisma.teacherAllocation.findMany({
      where: {
        ...(sectionId && { sectionId }),
        ...(classId && { classId }),
        ...(teacherId && { teacherId }),
      },
      include: {
        academicYear: true,
        class: true,
        section: true,
        subject: true,
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: [{ class: { numericOrder: 'asc' } }, { section: { name: 'asc' } }],
    });

    return NextResponse.json({ allocations });
  } catch (error: any) {
    console.error('Error in GET /api/classes/teachers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch allocations' }, { status: 500 });
  }
}

/**
 * POST /api/classes/teachers
 * Allocates a subject teacher to a section for a specific subject.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { sectionId, subjectId, teacherId, periodsPerWeek = 5, academicYearId } = body;

    if (!sectionId || !subjectId || !teacherId) {
      return NextResponse.json(
        { error: 'sectionId, subjectId, and teacherId are all required.' },
        { status: 400 }
      );
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true },
    });
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const targetYearId = academicYearId || section.class.academicYearId;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!activeYear) {
        return NextResponse.json({ error: 'No active academic year found' }, { status: 400 });
      }
    }

    // Check if an allocation already exists for this section & subject
    const existing = await prisma.teacherAllocation.findFirst({
      where: {
        sectionId,
        subjectId,
        academicYearId: targetYearId || undefined,
        role: 'SUBJECT_TEACHER',
      },
      include: {
        teacher: { include: { user: true } },
      },
    });

    if (existing) {
      // Update the teacher allocation
      const updated = await prisma.teacherAllocation.update({
        where: { id: existing.id },
        data: {
          teacherId,
          periodsPerWeek: Number(periodsPerWeek) || 5,
        },
        include: {
          teacher: { include: { user: true } },
          subject: true,
          section: true,
        },
      });

      return NextResponse.json({
        message: `Updated subject teacher for ${updated.subject?.name} to ${updated.teacher.user.firstName} ${updated.teacher.user.lastName}.`,
        allocation: updated,
      });
    }

    // Create new allocation
    const allocation = await prisma.teacherAllocation.create({
      data: {
        academicYearId: targetYearId!,
        classId: section.classId,
        sectionId,
        subjectId,
        teacherId,
        role: 'SUBJECT_TEACHER',
        periodsPerWeek: Number(periodsPerWeek) || 5,
      },
      include: {
        teacher: { include: { user: true } },
        subject: true,
        section: true,
      },
    });

    return NextResponse.json({
      message: `Assigned ${allocation.teacher.user.firstName} ${allocation.teacher.user.lastName} as Subject Teacher for ${allocation.subject?.name}.`,
      allocation,
    });
  } catch (error: any) {
    console.error('Error creating teacher allocation:', error);
    return NextResponse.json({ error: error.message || 'Failed to allocate teacher' }, { status: 500 });
  }
}

/**
 * DELETE /api/classes/teachers
 * Removes a subject teacher allocation.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
    }

    await prisma.teacherAllocation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Subject teacher allocation removed.' });
  } catch (error: any) {
    console.error('Error deleting teacher allocation:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete allocation' }, { status: 500 });
  }
}
