import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, revisionId, isCompleted } = body;

    if (action === 'TOGGLE_REVISION' && revisionId) {
      const updated = await prisma.revisionSchedule.update({
        where: { id: revisionId },
        data: { isCompleted: Boolean(isCompleted) },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE_REVISION_SCHEDULE',
        module: 'ACADEMICS',
        recordId: revisionId,
        newValue: `Toggled revision status to ${Boolean(isCompleted) ? 'Completed' : 'Pending'}`,
      });

      return NextResponse.json({ success: true, revision: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
