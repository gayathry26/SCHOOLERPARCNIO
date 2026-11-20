import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { leaveType, startDate, endDate, reason } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const leave = await prisma.leaveRequest.create({
      data: {
        teacherId: user.teacherProfileId || undefined,
        staffId: user.staffProfileId || undefined,
        leaveType: leaveType || 'CASUAL',
        startDate: start,
        endDate: end,
        daysCount: diffDays,
        reason,
        status: 'PENDING',
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'SUBMIT_LEAVE_REQUEST',
      module: 'HR',
      recordId: leave.id,
      newValue: `Submitted ${leaveType} leave for ${diffDays} days (${reason})`,
    });

    return NextResponse.json({ success: true, leave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'HR_MANAGER' && user.role !== 'SCHOOL_ADMIN' && user.role !== 'PRINCIPAL' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { leaveId, status, remarks } = await req.json();

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        approvedBy: `${user.firstName} ${user.lastName} (${user.role})`,
        actionRemarks: remarks || undefined,
      },
      include: {
        teacher: { include: { user: true } },
        staff: { include: { user: true } },
      },
    });

    const targetUser = updated.teacher?.user || updated.staff?.user;
    if (targetUser) {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          title: `Leave Request ${status}`,
          message: `Your leave application for ${formatDate(updated.startDate)} to ${formatDate(updated.endDate)} has been ${status}.`,
          type: 'HR',
          link: '/dashboard/hr',
        },
      });
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: `LEAVE_${status}`,
      module: 'HR',
      recordId: leaveId,
      newValue: `Leave request ${status} with remarks: ${remarks || 'None'}`,
    });

    return NextResponse.json({ success: true, leave: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
