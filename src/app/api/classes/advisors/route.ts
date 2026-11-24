import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/classes/advisors
 * Returns all active section-advisor pairs and assignment audit log history.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const teacherId = searchParams.get('teacherId');

    // 1. Current active assignments
    const activeAssignments = await prisma.section.findMany({
      where: {
        isActive: true,
        classTeacherId: { not: null },
        ...(sectionId && { id: sectionId }),
        ...(teacherId && { classTeacherId: teacherId }),
      },
      select: {
        id: true,
        name: true,
        roomNo: true,
        capacity: true,
        class: {
          select: { id: true, name: true, numericOrder: true, stream: true },
        },
        classTeacher: {
          select: {
            id: true,
            employeeCode: true,
            specialization: true,
            designation: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ class: { numericOrder: 'asc' } }, { name: 'asc' }],
    });

    // 2. Assignment audit history
    const historyLogs = await prisma.classAdvisorAssignmentLog.findMany({
      where: {
        ...(sectionId && { sectionId }),
        ...(teacherId && { teacherId }),
      },
      include: {
        section: {
          include: { class: { select: { name: true } } },
        },
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 3. Available faculty eligible for advisor duty
    const faculty = await prisma.teacherProfile.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        employeeCode: true,
        specialization: true,
        designation: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        sections: {
          where: { isActive: true },
          select: { id: true, name: true, class: { select: { name: true } } },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return NextResponse.json({
      activeAssignments,
      historyLogs,
      faculty: faculty.map((f) => ({
        id: f.id,
        name: `${f.user.firstName} ${f.user.lastName}`,
        email: f.user.email,
        employeeCode: f.employeeCode,
        specialization: f.specialization,
        designation: f.designation,
        isCurrentlyAdvisor: f.sections.length > 0,
        assignedSections: f.sections.map((s) => `${s.class.name}-${s.name}`),
      })),
    });
  } catch (error: any) {
    console.error('Error in GET /api/classes/advisors:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch class advisors' }, { status: 500 });
  }
}

/**
 * POST /api/classes/advisors
 * Assigns or reassigns a Class Advisor to a section with strict conflict detection.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { sectionId, teacherId, remarks, allowTransfer = false } = body;

    if (!sectionId || !teacherId) {
      return NextResponse.json(
        { error: 'Both sectionId and teacherId are required.' },
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

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Conflict Check: Is this teacher already an advisor to another section?
    const existingSection = await prisma.section.findFirst({
      where: { classTeacherId: teacherId, isActive: true, NOT: { id: sectionId } },
      include: { class: true },
    });

    if (existingSection && !allowTransfer) {
      return NextResponse.json(
        {
          error: `CONFLICT: ${teacher.user.firstName} ${teacher.user.lastName} is currently the assigned Class Advisor for ${existingSection.class.name} - Section ${existingSection.name}.`,
          conflictSection: {
            id: existingSection.id,
            name: `${existingSection.class.name} - Section ${existingSection.name}`,
          },
          canTransfer: true,
        },
        { status: 409 }
      );
    }

    // If allowTransfer is true and teacher had an existing section, relieve them from the old section
    if (existingSection && allowTransfer) {
      await prisma.section.update({
        where: { id: existingSection.id },
        data: { classTeacherId: null },
      });

      await prisma.classAdvisorAssignmentLog.updateMany({
        where: { sectionId: existingSection.id, teacherId, status: 'ACTIVE' },
        data: {
          endDate: new Date(),
          status: 'TRANSFERRED',
          remarks: `Transferred to ${section.class.name} - Section ${section.name} by ${user.firstName} ${user.lastName}`,
        },
      });

      await prisma.teacherAllocation.deleteMany({
        where: { sectionId: existingSection.id, teacherId, role: 'CLASS_TEACHER' },
      });
    }

    // Relieve existing advisor of current section if different
    const previousAdvisorId = section.classTeacherId;
    if (previousAdvisorId && previousAdvisorId !== teacherId) {
      await prisma.classAdvisorAssignmentLog.updateMany({
        where: { sectionId: section.id, teacherId: previousAdvisorId, status: 'ACTIVE' },
        data: {
          endDate: new Date(),
          status: 'RELIEVED',
          remarks: remarks || `Replaced by ${teacher.user.firstName} ${teacher.user.lastName}`,
        },
      });

      await prisma.teacherAllocation.deleteMany({
        where: { sectionId: section.id, teacherId: previousAdvisorId, role: 'CLASS_TEACHER' },
      });
    }

    // Assign to current section
    await prisma.section.update({
      where: { id: sectionId },
      data: { classTeacherId: teacherId },
    });

    // Create assignment history entry
    await prisma.classAdvisorAssignmentLog.create({
      data: {
        sectionId,
        academicYearId: section.class.academicYearId,
        teacherId,
        assignedById: user.id,
        status: 'ACTIVE',
        remarks: remarks || `Assigned as Class Advisor by ${user.firstName} ${user.lastName}`,
      },
    });

    // Sync TeacherAllocation for class teacher role
    if (section.class.academicYearId) {
      await prisma.teacherAllocation.create({
        data: {
          academicYearId: section.class.academicYearId,
          teacherId,
          classId: section.classId,
          sectionId,
          role: 'CLASS_TEACHER',
          periodsPerWeek: 5,
        },
      });
    }

    return NextResponse.json({
      message: `Successfully assigned ${teacher.user.firstName} ${teacher.user.lastName} as Class Advisor for ${section.class.name} - Section ${section.name}.`,
    });
  } catch (error: any) {
    console.error('Error assigning class advisor:', error);
    return NextResponse.json({ error: error.message || 'Failed to assign class advisor' }, { status: 500 });
  }
}

/**
 * DELETE /api/classes/advisors
 * Relieves the Class Advisor from a section.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const remarks = searchParams.get('remarks');

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { classTeacher: { include: { user: true } }, class: true },
    });
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    if (!section.classTeacherId) {
      return NextResponse.json({ message: 'Section currently has no assigned advisor.' });
    }

    const teacherName = `${section.classTeacher?.user.firstName || 'Faculty'} ${section.classTeacher?.user.lastName || ''}`;

    // Relieve in log
    await prisma.classAdvisorAssignmentLog.updateMany({
      where: { sectionId, teacherId: section.classTeacherId, status: 'ACTIVE' },
      data: {
        endDate: new Date(),
        status: 'RELIEVED',
        remarks: remarks || `Relieved by ${user.firstName} ${user.lastName}`,
      },
    });

    // Remove allocation
    await prisma.teacherAllocation.deleteMany({
      where: { sectionId, teacherId: section.classTeacherId, role: 'CLASS_TEACHER' },
    });

    // Unassign in section
    await prisma.section.update({
      where: { id: sectionId },
      data: { classTeacherId: null },
    });

    return NextResponse.json({
      message: `Class Advisor ${teacherName} successfully relieved from ${section.class.name} - Section ${section.name}.`,
    });
  } catch (error: any) {
    console.error('Error relieving class advisor:', error);
    return NextResponse.json({ error: error.message || 'Failed to relieve class advisor' }, { status: 500 });
  }
}
