import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';
import { verifySectionAccess } from '@/lib/classAdvisorGuard';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    // If teacher provided a sectionId, check authorization
    if (user.role === 'TEACHER' && sectionId) {
      const access = await verifySectionAccess(user, sectionId);
      if (!access.authorized) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view attendance for this section.' },
          { status: 403 }
        );
      }
    }

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        sectionId: sectionId || undefined,
        date: {
          gte: date,
          lt: nextDate,
        },
      },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessModule(user.role, 'ATTENDANCE') || ['STUDENT', 'PARENT'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges to submit attendance' }, { status: 403 });
    }

    const { sectionId, dateStr, records } = await req.json();

    if (!sectionId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid attendance payload' }, { status: 400 });
    }

    // RBAC check: verify section access for teacher
    if (user.role === 'TEACHER') {
      const access = await verifySectionAccess(user, sectionId);
      if (!access.authorized) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to mark attendance for this class section.' },
          { status: 403 }
        );
      }
    }

    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!currentYear) return NextResponse.json({ error: 'Active year not found' }, { status: 400 });

    const targetDate = new Date(dateStr || new Date());
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Save attendance for each student in the batch
    for (const item of records) {
      // Find existing record for this exact date
      const existing = await prisma.attendanceRecord.findFirst({
        where: {
          studentId: item.studentId,
          sectionId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existing) {
        await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            status: item.status,
            remarks: item.remarks || undefined,
          },
        });
      } else {
        await prisma.attendanceRecord.create({
          data: {
            academicYearId: currentYear.id,
            sectionId,
            studentId: item.studentId,
            date: targetDate,
            status: item.status,
            remarks: item.remarks || undefined,
          },
        });
      }

      // If marked ABSENT, automatically trigger notification for the linked parent!
      if (item.status === 'ABSENT') {
        const student = await prisma.studentProfile.findUnique({
          where: { id: item.studentId },
          include: {
            user: true,
            parents: { include: { parent: { include: { user: true } } } },
          },
        });

        if (student?.parents[0]?.parent?.user) {
          await prisma.notification.create({
            data: {
              userId: student.parents[0].parent.user.id,
              title: `Absence Notice: ${student.user.firstName}`,
              message: `Your ward ${student.user.firstName} ${student.user.lastName} has been marked ABSENT on ${targetDate.toLocaleDateString('en-IN')}. Please submit a leave application if unwell.`,
              type: 'ATTENDANCE',
              link: '/dashboard/attendance',
            },
          });
        }
      }
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'BATCH_MARK_ATTENDANCE',
      module: 'ATTENDANCE',
      newValue: `Marked attendance for ${records.length} students in section on ${dateStr}`,
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (error: any) {
    console.error('Attendance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
