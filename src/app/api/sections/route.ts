import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sections
 * Returns sections, optionally filtered by classId.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const sections = await prisma.section.findMany({
      where: {
        ...(classId && { classId }),
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        class: true,
        classTeacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ class: { numericOrder: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json({ sections });
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sections' }, { status: 500 });
  }
}

/**
 * POST /api/sections
 * Creates a new section under a specified class.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { classId, name, roomNo = 'Room 101', capacity = 40, classTeacherId, isActive = true } = body;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Section name is required (e.g., A, B, C)' }, { status: 400 });
    }

    // Check if class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { academicYear: true },
    });
    if (!targetClass) {
      return NextResponse.json({ error: 'Selected Class does not exist' }, { status: 404 });
    }

    // Check if section already exists in this class
    const existing = await prisma.section.findFirst({
      where: { classId, name: name.trim().toUpperCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Section "${name.trim().toUpperCase()}" already exists in ${targetClass.name}.` },
        { status: 400 }
      );
    }

    // If assigning an advisor, verify teacher exists and check for conflicts
    if (classTeacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: classTeacherId },
        include: { user: true },
      });
      if (!teacher) {
        return NextResponse.json({ error: 'Selected Class Advisor teacher was not found.' }, { status: 404 });
      }

      // Check if teacher is already advisor of an active section
      const activeAdvisorSection = await prisma.section.findFirst({
        where: { classTeacherId, isActive: true },
        include: { class: true },
      });

      if (activeAdvisorSection) {
        return NextResponse.json(
          {
            error: `Teacher ${teacher.user.firstName} ${teacher.user.lastName} is already assigned as Class Advisor to ${activeAdvisorSection.class.name} - Section ${activeAdvisorSection.name}. Reassign or relieve them first to avoid conflicting responsibilities.`,
          },
          { status: 409 }
        );
      }
    }

    const newSection = await prisma.section.create({
      data: {
        classId,
        name: name.trim().toUpperCase(),
        roomNo: roomNo?.trim() || 'Room 101',
        capacity: Number(capacity) || 40,
        classTeacherId: classTeacherId || null,
        isActive: Boolean(isActive),
      },
      include: {
        class: true,
        classTeacher: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });

    // Record advisor assignment history and allocation
    if (classTeacherId) {
      await prisma.classAdvisorAssignmentLog.create({
        data: {
          sectionId: newSection.id,
          academicYearId: targetClass.academicYearId,
          teacherId: classTeacherId,
          assignedById: user.id,
          status: 'ACTIVE',
          remarks: `Initial Class Advisor allocation on section creation by ${user.firstName} ${user.lastName}.`,
        },
      });

      if (targetClass.academicYearId) {
        await prisma.teacherAllocation.create({
          data: {
            academicYearId: targetClass.academicYearId,
            teacherId: classTeacherId,
            classId: targetClass.id,
            sectionId: newSection.id,
            role: 'CLASS_TEACHER',
            periodsPerWeek: 5,
          },
        });
      }
    }

    return NextResponse.json({
      message: `Section ${targetClass.name} - ${newSection.name} created successfully.`,
      section: newSection,
    });
  } catch (error: any) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: error.message || 'Failed to create section' }, { status: 500 });
  }
}

/**
 * PUT /api/sections
 * Updates section metadata, capacity, active status, or changes Class Advisor.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, roomNo, capacity, classTeacherId, isActive, remarks } = body;

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    const currentSection = await prisma.section.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!currentSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const previousTeacherId = currentSection.classTeacherId;
    const isAdvisorChanging = classTeacherId !== undefined && classTeacherId !== previousTeacherId;

    // Check conflict if assigning new teacher
    if (isAdvisorChanging && classTeacherId) {
      const activeAdvisorSection = await prisma.section.findFirst({
        where: { classTeacherId, isActive: true, NOT: { id } },
        include: { class: true },
      });

      if (activeAdvisorSection) {
        const teacher = await prisma.teacherProfile.findUnique({
          where: { id: classTeacherId },
          include: { user: true },
        });
        return NextResponse.json(
          {
            error: `Teacher ${teacher?.user?.firstName || 'Faculty'} is already assigned as Class Advisor to ${activeAdvisorSection.class.name} - Section ${activeAdvisorSection.name}.`,
          },
          { status: 409 }
        );
      }
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim().toUpperCase() }),
        ...(roomNo !== undefined && { roomNo: roomNo?.trim() }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(classTeacherId !== undefined && { classTeacherId: classTeacherId || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        class: true,
        classTeacher: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        _count: { select: { enrollments: true } },
      },
    });

    // Handle advisor history log and allocation sync if changed
    if (isAdvisorChanging) {
      // 1. Relieve previous advisor if existed
      if (previousTeacherId) {
        await prisma.classAdvisorAssignmentLog.updateMany({
          where: {
            sectionId: id,
            teacherId: previousTeacherId,
            status: 'ACTIVE',
          },
          data: {
            endDate: new Date(),
            status: 'RELIEVED',
            remarks: remarks || `Replaced by ${user.firstName} ${user.lastName}`,
          },
        });

        // Remove old CLASS_TEACHER allocation
        await prisma.teacherAllocation.deleteMany({
          where: {
            sectionId: id,
            teacherId: previousTeacherId,
            role: 'CLASS_TEACHER',
          },
        });
      }

      // 2. Add new advisor log if new teacher assigned
      if (classTeacherId) {
        await prisma.classAdvisorAssignmentLog.create({
          data: {
            sectionId: id,
            academicYearId: currentSection.class.academicYearId,
            teacherId: classTeacherId,
            assignedById: user.id,
            status: 'ACTIVE',
            remarks: remarks || `Assigned as Class Advisor by ${user.firstName} ${user.lastName}`,
          },
        });

        if (currentSection.class.academicYearId) {
          await prisma.teacherAllocation.create({
            data: {
              academicYearId: currentSection.class.academicYearId,
              teacherId: classTeacherId,
              classId: currentSection.classId,
              sectionId: id,
              role: 'CLASS_TEACHER',
              periodsPerWeek: 5,
            },
          });
        }
      }
    }

    return NextResponse.json({
      message: `Section ${updatedSection.class.name} - ${updatedSection.name} updated successfully.`,
      section: updatedSection,
    });
  } catch (error: any) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: error.message || 'Failed to update section' }, { status: 500 });
  }
}

/**
 * DELETE /api/sections
 * Deletes a section if no students are actively enrolled.
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
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    const enrollmentCount = await prisma.studentEnrollment.count({
      where: { sectionId: id },
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete section: ${enrollmentCount} student(s) are actively enrolled in this section. Transfer students first.`,
        },
        { status: 400 }
      );
    }

    await prisma.section.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Section deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete section' }, { status: 500 });
  }
}
