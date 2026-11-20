import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized faculty and administrators can enter or edit marks.' },
        { status: 403 }
      );
    }

    const { examScheduleId, markEntries } = await req.json();

    if (!examScheduleId || !markEntries || !Array.isArray(markEntries)) {
      return NextResponse.json({ error: 'Invalid marks entry payload' }, { status: 400 });
    }

    const schedule = await prisma.examSchedule.findUnique({
      where: { id: examScheduleId },
      include: { exam: true, subject: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Exam schedule not found' }, { status: 404 });
    }

    if (schedule.exam.isLocked) {
      return NextResponse.json(
        { error: 'Exam results are LOCKED. Only authorized admin can unlock for modifications.' },
        { status: 403 }
      );
    }

    // Validate all marks before persisting any record
    for (const entry of markEntries) {
      const theory = Number(entry.theoryMarks || 0);
      const practical = Number(entry.practicalMarks || 0);
      const grace = Number(entry.graceMarks || 0);

      if (theory < 0 || practical < 0 || (theory + practical) > schedule.maxMarks) {
        return NextResponse.json(
          { error: `Total marks obtained (${theory + practical}) exceed the maximum allowable marks (${schedule.maxMarks}).` },
          { status: 400 }
        );
      }
      if (grace < 0) {
        return NextResponse.json(
          { error: 'Grace marks cannot be negative.' },
          { status: 400 }
        );
      }
    }

    for (const entry of markEntries) {
      const existing = await prisma.examMarkEntry.findFirst({
        where: {
          examScheduleId,
          studentId: entry.studentId,
        },
      });

      if (existing) {
        await prisma.examMarkEntry.update({
          where: { id: existing.id },
          data: {
            theoryMarks: Number(entry.theoryMarks || 0),
            practicalMarks: Number(entry.practicalMarks || 0),
            graceMarks: Number(entry.graceMarks || 0),
            isAbsent: Boolean(entry.isAbsent),
            remarks: entry.remarks || undefined,
          },
        });
      } else {
        await prisma.examMarkEntry.create({
          data: {
            examScheduleId,
            studentId: entry.studentId,
            theoryMarks: Number(entry.theoryMarks || 0),
            practicalMarks: Number(entry.practicalMarks || 0),
            graceMarks: Number(entry.graceMarks || 0),
            isAbsent: Boolean(entry.isAbsent),
            remarks: entry.remarks || undefined,
          },
        });
      }
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_EXAM_MARKS',
      module: 'EXAMS',
      recordId: examScheduleId,
      newValue: `Updated marks for ${markEntries.length} students in ${schedule.subject.name} (${schedule.exam.name})`,
    });

    return NextResponse.json({ success: true, count: markEntries.length });
  } catch (error: any) {
    console.error('Error in marks entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
