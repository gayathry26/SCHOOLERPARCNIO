import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, subscription, title, message, url } = body;

    if (action === 'SUBSCRIBE') {
      // In production, save subscription payload to database
      await logAudit({
        schoolId: user.schoolId || 'edvonest-main-school',
        userId: user.id,
        action: 'PWA_PUSH_SUBSCRIBE',
        module: 'COMMUNICATION',
        newValue: `User ${user.email} registered device for PWA push alerts.`,
      });

      return NextResponse.json({
        success: true,
        message: 'Device subscribed to PWA push notifications.',
      });
    }

    if (action === 'TEST_PUSH') {
      const pushTitle = title || 'EdvoNest Instant Alert';
      const pushMsg = message || 'Fee receipt #RCP-2026-001 has been generated. Tap to view.';

      // Create notification record in DB
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: pushTitle,
          message: pushMsg,
          type: 'ANNOUNCEMENT',
          link: url || '/dashboard',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Push notification simulated & dispatched.',
        notification: { title: pushTitle, message: pushMsg },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('PWA Push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
