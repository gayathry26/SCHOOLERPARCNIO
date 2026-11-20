import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER', 'HR_MANAGER'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only faculty and administrators can broadcast announcements.' },
        { status: 403 }
      );
    }

    const { title, content, targetAudience, priority } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const ann = await prisma.announcement.create({
      data: {
        schoolId: user.schoolId || 'EDVONEST-DEL-01',
        title,
        content,
        targetAudience: targetAudience || 'ALL',
        priority: priority || 'NORMAL',
        authorName: `${user.firstName} ${user.lastName} (${user.role})`,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'PUBLISH_ANNOUNCEMENT',
      module: 'COMMUNICATION',
      recordId: ann.id,
      newValue: `Published announcement "${title}" for audience: ${targetAudience}`,
    });

    return NextResponse.json({ success: true, announcement: ann });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
