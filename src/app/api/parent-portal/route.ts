import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Determine parent profile or fallback for Admin/Demo
    let parentProfile = await prisma.parentProfile.findFirst({
      where: { userId: user.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true,
                enrollments: { include: { class: true, section: true } },
              },
            },
          },
        },
      },
    });

    if (!parentProfile) {
      parentProfile = await prisma.parentProfile.findFirst({
        include: {
          students: {
            include: {
              student: {
                include: {
                  user: true,
                  enrollments: { include: { class: true, section: true } },
                },
              },
            },
          },
        },
      });
    }

    const studentId = parentProfile?.students[0]?.studentId;

    const [ptmBookings, digitalConsents, homeworkList, teachers, invoices] = await Promise.all([
      parentProfile
        ? (
            await prisma.ptmBooking.findMany({
              where: { parentId: parentProfile.id },
              include: {
                teacher: { include: { user: true } },
                student: { include: { user: true } },
                ptmEvent: true,
                followUps: true,
              },
              orderBy: { scheduledDate: 'asc' },
            })
          ).map((b) => {
            const { privateTeacherNotes, ...sanitized } = b;
            return sanitized;
          })
        : [],
      parentProfile
        ? prisma.digitalConsent.findMany({
            where: { parentId: parentProfile.id },
            include: { student: { include: { user: true } } },
            orderBy: { deadline: 'asc' },
          })
        : [],
      studentId
        ? prisma.homework.findMany({
            take: 10,
            orderBy: { dueDate: 'desc' },
            include: { subject: true },
          })
        : [],
      prisma.teacherProfile.findMany({
        include: { user: true },
        take: 20,
      }),
      studentId
        ? prisma.studentFeeInvoice.findMany({
            where: { studentId },
            include: { payments: true },
            take: 10,
            orderBy: { dueDate: 'desc' },
          })
        : [],
    ]);

    return NextResponse.json({
      parentProfile,
      ptmBookings,
      digitalConsents,
      homeworkList,
      teachers,
      invoices,
    });
  } catch (error: any) {
    console.error('Parent Portal API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    let parentProfile = await prisma.parentProfile.findFirst({ where: { userId: user.id } });
    if (!parentProfile) {
      parentProfile = await prisma.parentProfile.findFirst();
    }

    if (!parentProfile) {
      return NextResponse.json({ error: 'Parent record not found' }, { status: 404 });
    }

    if (action === 'BOOK_PTM') {
      const { teacherId, scheduledDate, timeSlot, meetingMode, notes } = body;
      if (!teacherId || !scheduledDate) {
        return NextResponse.json({ error: 'Teacher and scheduled date are required' }, { status: 400 });
      }

      const booking = await prisma.ptmBooking.create({
        data: {
          parentId: parentProfile.id,
          teacherId,
          scheduledDate: new Date(scheduledDate),
          timeSlot: timeSlot || '10:00 AM - 10:20 AM',
          meetingMode: meetingMode || 'IN_PERSON',
          notes: notes || 'Discussion on second term academic progress',
          status: 'CONFIRMED',
        },
        include: { teacher: { include: { user: true } } },
      });

      // Dispatch confirmation
      await dispatchNotification({
        userId: user.id,
        title: 'PTM Slot Confirmed',
        message: `Your parent-teacher conference with ${booking.teacher?.user?.firstName || 'Faculty'} is confirmed for ${new Date(
          scheduledDate
        ).toLocaleDateString()} at ${timeSlot}.`,
        type: 'PTM_SCHEDULED',
        channels: ['IN_APP', 'WHATSAPP'],
        link: '/dashboard/parent-portal',
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'BOOK_PTM',
        module: 'PARENT_PORTAL',
        recordId: booking.id,
        newValue: `Booked PTM with teacher ${teacherId} for ${scheduledDate} (${timeSlot})`,
      });

      return NextResponse.json({ success: true, booking });
    }

    if (action === 'SIGN_CONSENT') {
      const { consentId, isAccepted } = body;
      if (!consentId) return NextResponse.json({ error: 'Consent ID is required' }, { status: 400 });

      const consent = await prisma.digitalConsent.findUnique({ where: { id: consentId } });
      if (!consent) return NextResponse.json({ error: 'Consent request not found' }, { status: 404 });

      const updated = await prisma.digitalConsent.update({
        where: { id: consentId },
        data: {
          isAccepted: isAccepted !== false,
          signedAt: new Date(),
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'SIGN_DIGITAL_CONSENT',
        module: 'PARENT_PORTAL',
        recordId: updated.id,
        newValue: `Parent signed consent: ${isAccepted !== false ? 'Accepted' : 'Declined'}`,
      });

      return NextResponse.json({ success: true, consent: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Parent Portal error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
