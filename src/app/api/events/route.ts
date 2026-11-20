import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { dispatchNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
import { canAccessModule } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [events, exams, homework, ptm, leaves, classes, students, timetable] = await Promise.all([
      prisma.schoolEvent.findMany({
        include: {
          participants: {
            include: {
              student: {
                include: { user: true, enrollments: { include: { class: true, section: true } } },
              },
            },
          },
          gallery: true,
        },
        orderBy: { startDate: 'asc' },
      }),
      prisma.examSchedule.findMany({
        include: {
          exam: true,
          subject: true,
        },
        orderBy: { examDate: 'asc' },
      }),
      prisma.homework.findMany({
        include: {
          class: true,
          section: true,
          subject: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.ptmBooking.findMany({
        include: {
          parent: { include: { user: true } },
          teacher: { include: { user: true } },
          student: { include: { user: true } },
          ptmEvent: true,
        },
        orderBy: { scheduledDate: 'asc' },
      }),
      prisma.leaveRequest.findMany({
        where: { status: 'APPROVED' },
        include: {
          teacher: { include: { user: true } },
          staff: { include: { user: true } },
        },
        orderBy: { startDate: 'asc' },
      }),
      prisma.class.findMany({
        include: { sections: true },
        orderBy: { name: 'asc' },
      }),
      prisma.studentProfile.findMany({
        include: {
          user: true,
          enrollments: { include: { class: true, section: true } },
        },
        take: 100,
      }),
      prisma.timetableEntry.findMany({
        include: {
          section: { include: { class: true } },
          subject: true,
          teacher: { include: { user: true } },
        },
      }),
    ]);

    return NextResponse.json({
      events,
      exams,
      homework,
      ptm,
      leaves,
      classes,
      students,
      timetable,
    });
  } catch (error: any) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ----------------------------------------------------
    // ACTION 1: CREATE_EVENT
    // ----------------------------------------------------
    if (action === 'CREATE_EVENT') {
      const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER'];
      if (!AUTHORIZED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient privileges to schedule events.' }, { status: 403 });
      }

      const {
        title,
        description,
        startDate,
        endDate,
        venue,
        category,
        classId,
        sectionId,
        targetRole,
        isRecurring,
        recurrencePattern,
        reminderMinutes,
        color,
      } = body;

      if (!title || !startDate) {
        return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
      }

      const event = await prisma.schoolEvent.create({
        data: {
          title,
          description: description || 'Campus academic event',
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : new Date(startDate),
          venue: venue || 'Campus Auditorium',
          category: category || 'EVENT',
          classId: classId && classId !== 'ALL' ? classId : null,
          sectionId: sectionId && sectionId !== 'ALL' ? sectionId : null,
          targetRole: targetRole || 'ALL',
          isRecurring: Boolean(isRecurring),
          recurrencePattern: recurrencePattern || null,
          reminderMinutes: Number(reminderMinutes) || 30,
          color: color || null,
        },
        include: { participants: true, gallery: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_EVENT',
        module: 'EVENTS',
        recordId: event.id,
        newValue: `Created event: ${title} (${category || 'EVENT'}) on ${startDate}`,
      });

      // Dispatch alert notification
      await dispatchNotification({
        userId: user.id,
        title: `Calendar Event: ${title}`,
        message: `${title} is scheduled for ${new Date(startDate).toLocaleDateString()} at ${venue || 'Campus Auditorium'}.`,
        type: 'SCHOOL_EVENT',
        channels: ['IN_APP', 'WHATSAPP'],
        link: '/dashboard/events',
      });

      return NextResponse.json({ success: true, event });
    }

    // ----------------------------------------------------
    // ACTION 2: UPDATE_EVENT
    // ----------------------------------------------------
    if (action === 'UPDATE_EVENT') {
      const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'];
      if (!AUTHORIZED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const {
        eventId,
        title,
        description,
        startDate,
        endDate,
        venue,
        category,
        classId,
        sectionId,
        targetRole,
        isRecurring,
        recurrencePattern,
        reminderMinutes,
        color,
      } = body;

      if (!eventId) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
      }

      const updated = await prisma.schoolEvent.update({
        where: { id: eventId },
        data: {
          title: title || undefined,
          description: description !== undefined ? description : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          venue: venue !== undefined ? venue : undefined,
          category: category || undefined,
          classId: classId && classId !== 'ALL' ? classId : null,
          sectionId: sectionId && sectionId !== 'ALL' ? sectionId : null,
          targetRole: targetRole || undefined,
          isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : undefined,
          recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : undefined,
          reminderMinutes: reminderMinutes !== undefined ? Number(reminderMinutes) : undefined,
          color: color !== undefined ? color : undefined,
        },
        include: { participants: true, gallery: true },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE_EVENT',
        module: 'EVENTS',
        recordId: eventId,
        newValue: `Updated calendar event ${title || eventId}`,
      });

      return NextResponse.json({ success: true, event: updated });
    }

    // ----------------------------------------------------
    // ACTION 3: DELETE_EVENT
    // ----------------------------------------------------
    if (action === 'DELETE_EVENT') {
      const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
      if (!AUTHORIZED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Only administrators can remove events.' }, { status: 403 });
      }

      const { eventId } = body;
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
      }

      await prisma.schoolEvent.delete({
        where: { id: eventId },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'DELETE_EVENT',
        module: 'EVENTS',
        recordId: eventId,
        newValue: `Deleted calendar event ${eventId}`,
      });

      return NextResponse.json({ success: true, message: 'Event deleted successfully.' });
    }

    // ----------------------------------------------------
    // ACTION 4: REGISTER_STUDENT
    // ----------------------------------------------------
    if (action === 'REGISTER_STUDENT') {
      const { eventId, studentId, roleOrCategory, parentConsentGiven } = body;
      if (!eventId || !studentId) {
        return NextResponse.json({ error: 'Event ID and Student ID are required' }, { status: 400 });
      }

      const registration = await prisma.eventRegistration.create({
        data: {
          eventId,
          studentId,
          roleOrCategory: roleOrCategory || 'General Participant',
          participationStatus: 'REGISTERED',
          parentConsentGiven: Boolean(parentConsentGiven ?? true),
        },
        include: {
          student: {
            include: { user: true, enrollments: { include: { class: true, section: true } } },
          },
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'REGISTER_EVENT_PARTICIPANT',
        module: 'EVENTS',
        recordId: registration.id,
        newValue: `Registered student ${studentId} for event ${eventId} (${roleOrCategory})`,
      });

      return NextResponse.json({ success: true, registration });
    }

    // ----------------------------------------------------
    // ACTION 5: ADD_GALLERY_ITEM
    // ----------------------------------------------------
    if (action === 'ADD_GALLERY_ITEM') {
      if (!canAccessModule(user.role, 'EVENTS')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { eventId, mediaUrl, caption } = body;
      if (!eventId || !mediaUrl) {
        return NextResponse.json({ error: 'Event ID and Media URL required' }, { status: 400 });
      }

      const item = await prisma.eventGalleryItem.create({
        data: {
          eventId,
          mediaUrl,
          caption: caption || 'Event memory',
          mediaType: 'IMAGE',
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ADD_EVENT_GALLERY_ITEM',
        module: 'EVENTS',
        recordId: item.id,
        newValue: `Added gallery item for event ${eventId}`,
      });

      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
