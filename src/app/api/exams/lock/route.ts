import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SCHOOL_ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'PRINCIPAL')) {
      return NextResponse.json({ error: 'Unauthorized. Only Admin or Principal can lock/unlock results.' }, { status: 403 });
    }

    const { examId, isLocked } = await req.json();

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        isLocked: Boolean(isLocked),
        lockedAt: isLocked ? new Date() : null,
        lockedBy: isLocked ? `${user.firstName} ${user.lastName} (${user.role})` : null,
        isPublished: isLocked ? true : undefined,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: isLocked ? 'LOCK_EXAM_RESULTS' : 'UNLOCK_EXAM_RESULTS',
      module: 'EXAMS',
      recordId: exam.id,
      newValue: isLocked ? `Exam ${exam.name} finalized and locked.` : `Exam ${exam.name} unlocked for marks correction.`,
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
