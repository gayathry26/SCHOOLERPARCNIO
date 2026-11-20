import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId, message, studentId } = await req.json();

    if (!receiverId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Recipient and message content are required.' }, { status: 400 });
    }

    const msg = await prisma.directMessage.create({
      data: {
        senderId: user.id,
        receiverId,
        studentId,
        message: message.trim(),
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `New Message from ${user.firstName} ${user.lastName}`,
        message: message.slice(0, 80) + '...',
        type: 'COMMUNICATION',
        link: '/dashboard/communication',
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'SEND_DIRECT_MESSAGE',
      module: 'COMMUNICATION',
      recordId: msg.id,
      newValue: `Message sent to user ${receiverId}`,
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
