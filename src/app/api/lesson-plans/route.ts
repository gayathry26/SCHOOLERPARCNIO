import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ACADEMIC_STAFF = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
    if (!ACADEMIC_STAFF.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only faculty can manage lesson plans.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE') {
      const {
        classId,
        sectionId,
        subjectId,
        chapterId,
        topicTitle,
        learningObjectives,
        teachingMethod,
        materialsNeeded,
        scheduledDate,
      } = body;

      // Find teacher profile for user or fallback to first teacher
      let teacherId = user.teacherProfileId;
      if (!teacherId) {
        const t = await prisma.teacherProfile.findFirst();
        teacherId = t?.id;
      }

      if (!teacherId) {
        return NextResponse.json({ error: 'No teacher profile found' }, { status: 400 });
      }

      const plan = await prisma.lessonPlan.create({
        data: {
          teacherId,
          classId,
          sectionId,
          subjectId,
          chapterId: chapterId || undefined,
          topicTitle,
          learningObjectives,
          teachingMethod: teachingMethod || 'Interactive lecture',
          materialsNeeded,
          scheduledDate: new Date(scheduledDate),
          status: 'SUBMITTED',
          completionStatus: 'PLANNED',
        },
        include: {
          teacher: { include: { user: true } },
          class: true,
          section: true,
          subject: true,
          chapter: true,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'SUBMIT_LESSON_PLAN',
        module: 'ACADEMICS',
        recordId: plan.id,
        newValue: `Submitted lesson plan: ${topicTitle}`,
      });

      return NextResponse.json({ success: true, lessonPlan: plan });
    }

    if (action === 'APPROVE') {
      const LEADERSHIP = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
      if (!LEADERSHIP.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Only school leadership can approve lesson plans.' }, { status: 403 });
      }

      const { planId, remarks } = body;
      const updated = await prisma.lessonPlan.update({
        where: { id: planId },
        data: {
          status: 'APPROVED',
          principalRemarks: remarks || 'Approved by academic leadership',
          approvedById: user.id,
        },
        include: {
          teacher: { include: { user: true } },
          class: true,
          section: true,
          subject: true,
          chapter: true,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'APPROVE_LESSON_PLAN',
        module: 'ACADEMICS',
        recordId: planId,
        newValue: `Approved lesson plan ${updated.topicTitle}`,
      });

      return NextResponse.json({ success: true, lessonPlan: updated });
    }

    if (action === 'MARK_COMPLETED') {
      const { planId } = body;
      const updated = await prisma.lessonPlan.update({
        where: { id: planId },
        data: { completionStatus: 'COMPLETED' },
      });
      return NextResponse.json({ success: true, lessonPlan: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Lesson plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
