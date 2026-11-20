import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER', 'COUNSELLOR'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { alertId, action } = await req.json();

    if (action === 'RESOLVE' && alertId) {
      const updated = await prisma.academicAlert.update({
        where: { id: alertId },
        data: { status: 'RESOLVED' },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RESOLVE_ACADEMIC_ALERT',
        module: 'ACADEMICS',
        recordId: alertId,
        newValue: `Marked alert ${alertId} resolved by ${user.firstName} ${user.lastName}`,
      });

      return NextResponse.json({ success: true, alert: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
