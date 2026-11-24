import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { verifySectionAccess } from '@/lib/classAdvisorGuard';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const FACULTY_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
    if (!FACULTY_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only faculty can assign homework.' }, { status: 403 });
    }

    const { classId, sectionId, subjectId, title, description, dueDate, maxMarks } = await req.json();

    if (!classId || !sectionId || !subjectId || !title || !dueDate) {
      return NextResponse.json({ error: 'Class, section, subject, title, and due date are required.' }, { status: 400 });
    }

    // RBAC check: verify teacher has access to this section
    if (user.role === 'TEACHER') {
      const access = await verifySectionAccess(user, sectionId);
      if (!access.authorized) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to assign homework to this class section.' },
          { status: 403 }
        );
      }
    }

    const hw = await prisma.homework.create({
      data: {
        classId,
        sectionId,
        subjectId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks: Number(maxMarks) || 20,
      },
      include: { class: true, section: true, subject: true },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'CREATE_HOMEWORK',
      module: 'HOMEWORK',
      recordId: hw.id,
      newValue: `Assigned homework "${title}" to ${hw.class.name} (${hw.section.name}) for ${hw.subject.name}`,
    });

    return NextResponse.json({ success: true, homework: hw });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
