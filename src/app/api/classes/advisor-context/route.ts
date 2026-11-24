import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getTeacherAdvisorSections } from '@/lib/classAdvisorGuard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/classes/advisor-context
 * Returns the personalized cockpit payload for an assigned Class Advisor:
 * - Assigned Class & Section metadata
 * - Total students enrolled
 * - Present today, Absent today, Attendance percentage
 * - Pending homework submissions to grade
 * - Upcoming examinations scheduled for this section
 * - Student roster with today's status & parent contacts
 * - Class announcements
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admins and Principals can view any section or pass ?sectionId=xyz
    const { searchParams } = new URL(req.url);
    let targetSectionId = searchParams.get('sectionId');

    const isSchoolAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role);

    if (!targetSectionId) {
      if (user.role === 'TEACHER') {
        const advisorSections = await getTeacherAdvisorSections(user.id);
        if (advisorSections.length > 0) {
          targetSectionId = advisorSections[0].id;
        }
      } else if (isSchoolAdmin) {
        // Default to first active section
        const firstSection = await prisma.section.findFirst({
          where: { isActive: true },
          orderBy: { name: 'asc' },
        });
        targetSectionId = firstSection?.id || null;
      }
    }

    if (!targetSectionId) {
      return NextResponse.json({
        isAdvisor: false,
        message: 'No assigned class advisor section found for current user.',
      });
    }

    // Verify section
    const section = await prisma.section.findUnique({
      where: { id: targetSectionId },
      include: {
        class: true,
        classTeacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // If teacher, ensure they are authorized
    if (user.role === 'TEACHER' && section.classTeacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
      });
      if (section.classTeacherId !== teacher?.id && !isSchoolAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: You are not the assigned Class Advisor for this section.' },
          { status: 403 }
        );
      }
    }

    // 1. Fetch Students enrolled in this section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        sectionId: targetSectionId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            parents: {
              include: {
                parent: {
                  include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    const studentIds = enrollments.map((e) => e.studentId);
    const totalStudents = enrollments.length;

    // 2. Today's Attendance for this section
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAttendance = await prisma.attendanceRecord.findMany({
      where: {
        sectionId: targetSectionId,
        date: { gte: startOfToday, lte: endOfToday },
      },
    });

    const attendanceMap = new Map<string, string>();
    for (const record of todayAttendance) {
      attendanceMap.set(record.studentId, record.status);
    }

    const presentCount = todayAttendance.filter((r) => r.status === 'PRESENT').length;
    const absentCount = todayAttendance.filter((r) => r.status === 'ABSENT').length;
    const lateCount = todayAttendance.filter((r) => r.status === 'LATE').length;
    const unmarkedCount = Math.max(0, totalStudents - todayAttendance.length);
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // 3. Pending Homework
    const pendingHomeworks = await prisma.homework.findMany({
      where: {
        sectionId: targetSectionId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // 4. Upcoming Examinations for this class
    const upcomingExams = await prisma.exam.findMany({
      where: {
        endDate: { gte: startOfToday },
        schedules: {
          some: {
            subject: {
              classId: section.classId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        term: true,
        startDate: true,
        endDate: true,
        isLocked: true,
      },
      orderBy: { startDate: 'asc' },
      take: 4,
    });

    // 5. Recent Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetAudience: 'ALL' }, { targetAudience: 'TEACHERS' }, { targetAudience: 'STUDENTS' }],
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    // Formatted student roster
    const studentRoster = enrollments.map((e) => {
      const primaryParent = e.student.parents[0]?.parent;
      return {
        id: e.student.id,
        enrollmentId: e.id,
        rollNumber: e.rollNumber || '—',
        admissionNumber: e.student.admissionNumber,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        email: e.student.user.email,
        house: e.student.house || 'Emerald',
        todayStatus: attendanceMap.get(e.studentId) || 'UNMARKED',
        parentName: primaryParent?.user
          ? `${primaryParent.user.firstName} ${primaryParent.user.lastName}`
          : primaryParent?.relation || 'Guardian',
        parentPhone: primaryParent?.phone || e.student.emergencyContact || 'Not recorded',
      };
    });

    return NextResponse.json({
      isAdvisor: true,
      section: {
        id: section.id,
        name: section.name,
        roomNo: section.roomNo,
        capacity: section.capacity,
        className: section.class.name,
        classId: section.class.id,
        stream: section.class.stream,
        advisorName: section.classTeacher?.user
          ? `${section.classTeacher.user.firstName} ${section.classTeacher.user.lastName}`
          : 'Faculty Assigned',
      },
      stats: {
        totalStudents,
        capacity: section.capacity,
        availableSeats: Math.max(0, section.capacity - totalStudents),
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount,
        unmarkedToday: unmarkedCount,
        attendancePercentage,
        pendingHomeworkCount: pendingHomeworks.length,
        upcomingExamsCount: upcomingExams.length,
      },
      pendingHomeworks,
      upcomingExams,
      announcements,
      studentRoster,
    });
  } catch (error: any) {
    console.error('Error fetching advisor context:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch advisor context' }, { status: 500 });
  }
}
