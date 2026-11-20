import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessModule(user.role, 'EXAMINATIONS')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, term, startDate, endDate, academicYearId, schedules } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 });
    }

    // Default current academic year if not provided
    let yearId = academicYearId;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      yearId = currentYear?.id;
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        term: term || 'TERM 1',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        academicYearId: yearId,
        isPublished: false,
        isLocked: false,
        schedules: {
          create: (schedules || []).map((s: any) => ({
            subjectId: s.subjectId,
            examDate: new Date(s.examDate || startDate),
            maxMarks: parseFloat(s.maxMarks || 100),
            passMarks: parseFloat(s.passMarks || 33),
          })),
        },
      },
      include: {
        schedules: {
          include: {
            subject: true,
            markEntries: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: error.message || 'Failed to create exam' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessModule(user.role, 'EXAMINATIONS')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { examId, isPublished } = body;

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        isPublished: isPublished ?? true,
      },
      include: {
        schedules: {
          include: {
            subject: true,
            markEntries: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, exam: updatedExam });
  } catch (error: any) {
    console.error('Error publishing exam:', error);
    return NextResponse.json({ error: error.message || 'Failed to update exam' }, { status: 500 });
  }
}
