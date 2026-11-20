import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { homeworkId, submissionText, studentId: explicitStudentId } = await req.json();

    if (!homeworkId) {
      return NextResponse.json({ error: 'Homework ID is required.' }, { status: 400 });
    }

    let targetStudentId = explicitStudentId;

    if (!targetStudentId) {
      if (user.role === 'STUDENT') {
        const studentProfile = await prisma.studentProfile.findFirst({ where: { userId: user.id } });
        targetStudentId = studentProfile?.id;
      } else if (user.role === 'PARENT') {
        const parentProfile = await prisma.parentProfile.findFirst({
          where: { userId: user.id },
          include: { students: true },
        });
        targetStudentId = parentProfile?.students[0]?.studentId;
      }
    }

    if (!targetStudentId) {
      return NextResponse.json({ error: 'Student profile not resolved for submission.' }, { status: 400 });
    }

    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
    });

    if (!homework) {
      return NextResponse.json({ error: 'Homework assignment not found.' }, { status: 404 });
    }

    // Check if submission already exists
    const existing = await prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId,
        studentId: targetStudentId,
      },
    });

    let submission;
    if (existing) {
      submission = await prisma.homeworkSubmission.update({
        where: { id: existing.id },
        data: {
          submissionText: submissionText || 'Online homework submission completed.',
          status: 'RESUBMITTED',
          submittedDate: new Date(),
        },
      });
    } else {
      submission = await prisma.homeworkSubmission.create({
        data: {
          homeworkId,
          studentId: targetStudentId,
          submissionText: submissionText || 'Online homework submission completed.',
          status: 'SUBMITTED',
        },
      });
    }

    await logAudit({
      schoolId: user.schoolId || 'edvonest-main-school',
      userId: user.id,
      action: 'SUBMIT_HOMEWORK',
      module: 'ACADEMICS',
      recordId: submission.id,
      newValue: `Submitted homework for assignment ${homework.title}`,
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error('Homework submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
