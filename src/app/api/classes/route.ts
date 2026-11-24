import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getTeacherAuthorizedSections } from '@/lib/classAdvisorGuard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/classes
 * Retrieves classes and sections.
 * Supports:
 * - lookup=true for lightweight global dropdowns
 * - academicYearId filter
 * - Role-aware filtering: if caller is a Teacher, tags advisor and allocated sections.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lookup = searchParams.get('lookup') === 'true';
    const academicYearId = searchParams.get('academicYearId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // If teacher, resolve their authorizations
    let teacherAllocations: any = null;
    if (user.role === 'TEACHER') {
      teacherAllocations = await getTeacherAuthorizedSections(user.id);
    }

    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }
    if (academicYearId) {
      whereClause.academicYearId = academicYearId;
    }

    if (lookup) {
      const classes = await prisma.class.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          numericOrder: true,
          stream: true,
          isActive: true,
          sections: {
            where: includeInactive ? {} : { isActive: true },
            select: {
              id: true,
              name: true,
              roomNo: true,
              capacity: true,
              classTeacherId: true,
              isActive: true,
              classTeacher: {
                select: {
                  id: true,
                  employeeCode: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
              _count: { select: { enrollments: true } },
            },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { numericOrder: 'asc' },
      });

      // Format for clean global dropdowns
      const formatted = classes.map((c) => ({
        id: c.id,
        name: c.name,
        numericOrder: c.numericOrder,
        stream: c.stream,
        isActive: c.isActive,
        sections: c.sections.map((s) => ({
          id: s.id,
          name: s.name,
          fullName: `${c.name} - Section ${s.name}`,
          roomNo: s.roomNo,
          capacity: s.capacity,
          enrolledCount: s._count.enrollments,
          availableSeats: Math.max(0, s.capacity - s._count.enrollments),
          advisorId: s.classTeacherId,
          advisorName: s.classTeacher?.user
            ? `${s.classTeacher.user.firstName} ${s.classTeacher.user.lastName}`
            : 'Unassigned',
          isTeacherAdvisor: teacherAllocations
            ? teacherAllocations.advisorSections.some((sec: any) => sec.id === s.id)
            : false,
          isTeacherAllocated: teacherAllocations
            ? teacherAllocations.allSectionIds.includes(s.id)
            : false,
        })),
      }));

      return NextResponse.json({
        classes: formatted,
        userRole: user.role,
        isSchoolAdmin: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role),
      });
    }

    // Full detailed query for Class & Section Management
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        academicYear: true,
        sections: {
          include: {
            classTeacher: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
              },
            },
            _count: { select: { enrollments: true } },
            teacherAllocations: {
              include: {
                teacher: {
                  include: { user: { select: { firstName: true, lastName: true } } },
                },
                subject: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        subjects: {
          select: { id: true, name: true, code: true },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { numericOrder: 'asc' },
    });

    return NextResponse.json({
      classes,
      totalClasses: classes.length,
      userRole: user.role,
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch classes' }, { status: 500 });
  }
}

/**
 * POST /api/classes
 * Creates a new class. Accessible only to Admins.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, numericOrder = 1, stream = 'General', academicYearId, isActive = true } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    // Default to active academic year if not provided
    let targetYearId = academicYearId;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      targetYearId = activeYear?.id || null;
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        numericOrder: Number(numericOrder) || 1,
        stream: stream?.trim() || 'General',
        isActive: Boolean(isActive),
        academicYearId: targetYearId,
      },
      include: {
        sections: true,
        academicYear: true,
      },
    });

    return NextResponse.json({
      message: `Class "${newClass.name}" created successfully.`,
      class: newClass,
    });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: error.message || 'Failed to create class' }, { status: 500 });
  }
}

/**
 * PUT /api/classes
 * Updates an existing class.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, numericOrder, stream, academicYearId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(numericOrder !== undefined && { numericOrder: Number(numericOrder) }),
        ...(stream !== undefined && { stream: stream?.trim() || 'General' }),
        ...(academicYearId !== undefined && { academicYearId }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        sections: {
          include: {
            classTeacher: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
            _count: { select: { enrollments: true } },
          },
        },
        academicYear: true,
      },
    });

    return NextResponse.json({
      message: `Class "${updatedClass.name}" updated successfully.`,
      class: updatedClass,
    });
  } catch (error: any) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: error.message || 'Failed to update class' }, { status: 500 });
  }
}

/**
 * DELETE /api/classes
 * Deletes a class if no student enrollments exist.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const enrollmentCount = await prisma.studentEnrollment.count({
      where: { classId: id },
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete class: ${enrollmentCount} student(s) are actively enrolled in this class. Transfer or promote students before deleting.`,
        },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Class deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete class' }, { status: 500 });
  }
}
