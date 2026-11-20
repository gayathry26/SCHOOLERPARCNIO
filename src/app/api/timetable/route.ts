import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only academic staff can configure timetables.' }, { status: 403 });
    }

    const { sectionId, subjectId, teacherId, dayOfWeek, periodIndex, startTime, endTime, roomNumber } =
      await req.json();

    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!currentYear) return NextResponse.json({ error: 'Active year not found' }, { status: 400 });

    // 1. Live Conflict Detection: Check Teacher Availability
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        academicYearId: currentYear.id,
        dayOfWeek,
        periodIndex: Number(periodIndex),
        teacherId,
        sectionId: { not: sectionId },
      },
      include: {
        section: { include: { class: true } },
        teacher: { include: { user: true } },
      },
    });

    if (teacherConflict) {
      return NextResponse.json(
        {
          error: `CLASH DETECTED: Teacher ${teacherConflict.teacher.user.firstName} is already assigned to ${teacherConflict.section.class.name} (${teacherConflict.section.name}) at Period ${periodIndex} on ${dayOfWeek}.`,
        },
        { status: 409 }
      );
    }

    // 2. Live Conflict Detection: Check Room Availability
    if (roomNumber) {
      const roomConflict = await prisma.timetableEntry.findFirst({
        where: {
          academicYearId: currentYear.id,
          dayOfWeek,
          periodIndex: Number(periodIndex),
          roomNumber,
          sectionId: { not: sectionId },
        },
        include: {
          section: { include: { class: true } },
        },
      });

      if (roomConflict) {
        return NextResponse.json(
          {
            error: `ROOM CLASH: ${roomNumber} is already occupied by ${roomConflict.section.class.name} - ${roomConflict.section.name} during Period ${periodIndex}.`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Upsert slot for this section & period
    const existing = await prisma.timetableEntry.findFirst({
      where: {
        academicYearId: currentYear.id,
        sectionId,
        dayOfWeek,
        periodIndex: Number(periodIndex),
      },
    });

    let entry;
    if (existing) {
      entry = await prisma.timetableEntry.update({
        where: { id: existing.id },
        data: {
          subjectId,
          teacherId,
          startTime: startTime || '08:30',
          endTime: endTime || '09:15',
          roomNumber,
        },
      });
    } else {
      entry = await prisma.timetableEntry.create({
        data: {
          academicYearId: currentYear.id,
          sectionId,
          subjectId,
          teacherId,
          dayOfWeek,
          periodIndex: Number(periodIndex),
          startTime: startTime || '08:30',
          endTime: endTime || '09:15',
          roomNumber,
        },
      });
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_TIMETABLE_SLOT',
      module: 'TIMETABLE',
      newValue: `Assigned Period ${periodIndex} (${dayOfWeek}) for section`,
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Timetable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
