import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const FACULTY_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
    if (!FACULTY_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only faculty can manage the question bank.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create Question
    if (action === 'CREATE_QUESTION') {
      const {
        subjectId,
        chapterId,
        questionType,
        difficulty,
        marks,
        questionText,
        explanation,
        optA,
        optB,
        optC,
        optD,
        correctOpt,
      } = body;

      const q = await prisma.question.create({
        data: {
          subjectId,
          chapterId: chapterId || undefined,
          questionType: questionType || 'MCQ',
          difficulty: difficulty || 'MEDIUM',
          marks: Number(marks) || 1,
          questionText,
          explanation,
          createdById: user.id,
          isApproved: true,
          options:
            questionType === 'MCQ' && optA
              ? {
                  create: [
                    { optionKey: 'A', optionText: optA, isCorrect: correctOpt === 'A' },
                    { optionKey: 'B', optionText: optB, isCorrect: correctOpt === 'B' },
                    { optionKey: 'C', optionText: optC, isCorrect: correctOpt === 'C' },
                    { optionKey: 'D', optionText: optD, isCorrect: correctOpt === 'D' },
                  ],
                }
              : undefined,
        },
        include: { subject: true, chapter: true, options: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_QUESTION',
        module: 'ACADEMICS',
        recordId: q.id,
        newValue: `Created ${questionType} question in ${q.subject.name}`,
      });

      return NextResponse.json({ success: true, question: q });
    }

    // 2. Generate Question Paper
    if (action === 'GENERATE_PAPER') {
      const { title, subjectId, classId, totalMarks, durationMinutes, instructions } = body;

      const paper = await prisma.questionPaper.create({
        data: {
          title,
          subjectId,
          classId,
          totalMarks: Number(totalMarks) || 80,
          durationMinutes: Number(durationMinutes) || 180,
          instructions,
          generatedById: user.id,
          isApproved: false,
        },
        include: { subject: true, class: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'GENERATE_QUESTION_PAPER',
        module: 'ACADEMICS',
        recordId: paper.id,
        newValue: `Generated question paper ${title}`,
      });

      return NextResponse.json({ success: true, paper });
    }

    // 3. Approve Question Paper
    if (action === 'APPROVE_PAPER') {
      const { paperId } = body;
      const updated = await prisma.questionPaper.update({
        where: { id: paperId },
        data: {
          isApproved: true,
          approvedById: user.id,
        },
        include: { subject: true, class: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'APPROVE_QUESTION_PAPER',
        module: 'ACADEMICS',
        recordId: paperId,
        newValue: `Approved question paper ${updated.title}`,
      });

      return NextResponse.json({ success: true, paper: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Question bank error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
