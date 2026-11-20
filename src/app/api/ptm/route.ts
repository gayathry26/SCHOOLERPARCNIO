import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sendAutomatedNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    // 1. Fetch user-specific profile context
    const isParent = user.role === 'PARENT';
    const isTeacher = ['TEACHER', 'CLASS_TEACHER'].includes(user.role);
    const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(user.role);

    let parentProfile: any = null;
    let teacherProfile: any = null;

    if (isParent) {
      parentProfile = await prisma.parentProfile.findUnique({
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
    }

    if (isTeacher) {
      teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });
    }

    // 2. Fetch PTM Events
    const events = await prisma.ptmEvent.findMany({
      orderBy: { eventDate: 'desc' },
      include: {
        _count: {
          select: {
            bookings: true,
            slots: true,
          },
        },
      },
    });

    // 3. Fetch Teachers list for booking selection
    const allTeachers = await prisma.teacherProfile.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    });

    // 4. Fetch Classes for class-wise filtering
    const classes = await prisma.class.findMany({
      include: { sections: true },
      orderBy: { numericOrder: 'asc' },
    });

    // 5. Fetch Bookings with Role-Specific Privacy Rules
    let bookingWhereClause: any = {};
    if (eventId) bookingWhereClause.ptmEventId = eventId;
    if (teacherId) bookingWhereClause.teacherId = teacherId;

    if (isParent && parentProfile) {
      bookingWhereClause.parentId = parentProfile.id;
    } else if (isTeacher && teacherProfile) {
      bookingWhereClause.teacherId = teacherProfile.id;
    }

    const rawBookings = await prisma.ptmBooking.findMany({
      where: bookingWhereClause,
      include: {
        ptmEvent: true,
        slot: true,
        teacher: { include: { user: true } },
        parent: { include: { user: true } },
        student: {
          include: {
            user: true,
            enrollments: { include: { class: true, section: true } },
          },
        },
        followUps: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: [{ scheduledDate: 'desc' }, { timeSlot: 'asc' }],
    });

    // 🔒 CRITICAL PRIVACY CONTROL:
    // If the requesting user is a PARENT or STUDENT, STRIP 'privateTeacherNotes'
    const bookings = rawBookings.map((b) => {
      if (isParent || user.role === 'STUDENT') {
        const { privateTeacherNotes, ...sanitized } = b;
        return sanitized;
      }
      return b;
    });

    // 6. Fetch Available / All Slots
    let slotWhereClause: any = {};
    if (eventId) slotWhereClause.ptmEventId = eventId;
    if (teacherId) slotWhereClause.teacherId = teacherId;

    const slots = await prisma.ptmSlot.findMany({
      where: slotWhereClause,
      include: {
        teacher: { include: { user: true } },
        ptmEvent: true,
      },
      orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
    });

    // 7. Calculate Analytics Summary
    const totalBookings = rawBookings.length;
    const completedCount = rawBookings.filter((b) => b.status === 'COMPLETED').length;
    const confirmedCount = rawBookings.filter((b) => b.status === 'CONFIRMED').length;
    const cancelledCount = rawBookings.filter((b) => b.status === 'CANCELLED').length;
    const noShowCount = rawBookings.filter((b) => b.status === 'NO_SHOW').length;

    return NextResponse.json({
      events,
      bookings,
      slots,
      teachers: allTeachers,
      classes,
      currentUserProfile: {
        isParent,
        isTeacher,
        isAdmin,
        parentProfile,
        teacherProfile,
      },
      analytics: {
        totalEvents: events.length,
        totalBookings,
        completedCount,
        confirmedCount,
        cancelledCount,
        noShowCount,
        completionRate: totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('PTM GET API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const isParent = user.role === 'PARENT';
    const isTeacher = ['TEACHER', 'CLASS_TEACHER'].includes(user.role);
    const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(user.role);

    // =========================================================================
    // 1. CREATE PTM EVENT (School Admins & Principals)
    // =========================================================================
    if (action === 'CREATE_EVENT') {
      if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const {
        title,
        description,
        eventDate,
        startTime,
        endTime,
        slotDuration = 15,
        bufferTime = 5,
        targetClassIds,
        meetingMode = 'HYBRID',
        locationRoom = 'Main Campus Classrooms',
        defaultMeetingLink,
        allowSubjectTeacherChoice = true,
        bookingDeadline,
        autoGenerateSlots = true,
      } = body;

      if (!title || !eventDate) {
        return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
      }

      const ptmEvent = await prisma.ptmEvent.create({
        data: {
          schoolId: user.schoolId || 'edvonest-main-school',
          title,
          description: description || null,
          eventDate: new Date(eventDate),
          startTime: startTime || '09:00 AM',
          endTime: endTime || '02:00 PM',
          slotDuration: parseInt(slotDuration) || 15,
          bufferTime: parseInt(bufferTime) || 5,
          targetClassIds: targetClassIds || 'ALL',
          status: 'OPEN_FOR_BOOKING',
          meetingMode: meetingMode || 'HYBRID',
          locationRoom: locationRoom || 'Main Campus Classrooms',
          defaultMeetingLink: defaultMeetingLink || null,
          allowSubjectTeacherChoice: Boolean(allowSubjectTeacherChoice),
          bookingDeadline: bookingDeadline ? new Date(bookingDeadline) : null,
        },
      });

      // Auto-generate standard slots for all active faculty if requested
      if (autoGenerateSlots) {
        const activeTeachers = await prisma.teacherProfile.findMany({
          where: { status: 'ACTIVE' },
          include: { user: true },
        });

        const slotTimes = [
          { start: '09:00 AM', end: '09:15 AM' },
          { start: '09:20 AM', end: '09:35 AM' },
          { start: '09:40 AM', end: '09:55 AM' },
          { start: '10:00 AM', end: '10:15 AM' },
          { start: '10:20 AM', end: '10:35 AM' },
          { start: '10:40 AM', end: '10:55 AM' },
          { start: '11:00 AM', end: '11:15 AM' },
          { start: '11:20 AM', end: '11:35 AM' },
          { start: '11:40 AM', end: '11:55 AM' },
          { start: '12:00 PM', end: '12:15 PM' },
          { start: '12:20 PM', end: '12:35 PM' },
          { start: '12:40 PM', end: '12:55 PM' },
        ];

        const slotsToCreate: any[] = [];
        for (const t of activeTeachers) {
          for (let i = 0; i < slotTimes.length; i++) {
            const st = slotTimes[i];
            slotsToCreate.push({
              ptmEventId: ptmEvent.id,
              teacherId: t.id,
              slotDate: new Date(eventDate),
              startTime: st.start,
              endTime: st.end,
              meetingMode: i % 2 === 0 ? 'IN_PERSON' : 'ONLINE_VIDEO',
              roomNumber: `Room 20${(i % 5) + 1}`,
              meetingLink: defaultMeetingLink || `https://meet.google.com/edv-${t.employeeCode.toLowerCase()}`,
              isBooked: false,
              isBlocked: false,
            });
          }
        }

        if (slotsToCreate.length > 0) {
          await prisma.ptmSlot.createMany({ data: slotsToCreate });
        }
      }

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'CREATE_PTM_EVENT',
        module: 'COMMUNICATION',
        recordId: ptmEvent.id,
        newValue: `Created PTM Event: ${ptmEvent.title} for ${eventDate}`,
      });

      return NextResponse.json({ success: true, ptmEvent });
    }

    // =========================================================================
    // 2. UPDATE EVENT STATUS (OPEN, COMPLETED, ARCHIVED)
    // =========================================================================
    if (action === 'UPDATE_EVENT_STATUS') {
      if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const { eventId, status } = body;
      const updated = await prisma.ptmEvent.update({
        where: { id: eventId },
        data: { status },
      });

      return NextResponse.json({ success: true, ptmEvent: updated });
    }

    // =========================================================================
    // 3. CONFIGURE TEACHER SLOTS
    // =========================================================================
    if (action === 'CONFIGURE_TEACHER_SLOTS') {
      const { teacherId, ptmEventId, slotDate, slots } = body;

      // Teachers can configure their own slots; Admins can configure for anyone
      if (!isAdmin) {
        const myTeacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
        if (!myTeacher || myTeacher.id !== teacherId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      if (!slots || !Array.isArray(slots)) {
        return NextResponse.json({ error: 'Valid slot time intervals required' }, { status: 400 });
      }

      const createdSlots = [];
      for (const s of slots) {
        const newSlot = await prisma.ptmSlot.create({
          data: {
            ptmEventId: ptmEventId || null,
            teacherId,
            slotDate: new Date(slotDate || Date.now()),
            startTime: s.startTime,
            endTime: s.endTime,
            meetingMode: s.meetingMode || 'IN_PERSON',
            roomNumber: s.roomNumber || 'Room 204',
            meetingLink: s.meetingLink || null,
            isBooked: false,
            isBlocked: false,
          },
        });
        createdSlots.push(newSlot);
      }

      return NextResponse.json({ success: true, slots: createdSlots });
    }

    // =========================================================================
    // 4. BLOCK / UNBLOCK SLOT
    // =========================================================================
    if (action === 'BLOCK_SLOT') {
      const { slotId, isBlocked, blockReason } = body;
      const slot = await prisma.ptmSlot.findUnique({ where: { id: slotId } });
      if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });

      if (!isAdmin) {
        const myTeacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
        if (!myTeacher || myTeacher.id !== slot.teacherId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      const updated = await prisma.ptmSlot.update({
        where: { id: slotId },
        data: {
          isBlocked: Boolean(isBlocked),
          blockReason: blockReason || null,
        },
      });

      return NextResponse.json({ success: true, slot: updated });
    }

    // =========================================================================
    // 5. BOOK TIME SLOT (Parents or Admins) — STRICT CONFLICT PREVENTION
    // =========================================================================
    if (action === 'BOOK_SLOT') {
      let parentId = body.parentId;
      if (isParent) {
        const myParent = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
        if (!myParent) return NextResponse.json({ error: 'Parent record not found' }, { status: 404 });
        parentId = myParent.id;
      }

      const { slotId, studentId, notes } = body;
      if (!slotId || !parentId) {
        return NextResponse.json({ error: 'Slot ID and parent identity are required' }, { status: 400 });
      }

      // Check slot availability
      const slot = await prisma.ptmSlot.findUnique({
        where: { id: slotId },
        include: { teacher: { include: { user: true } }, ptmEvent: true },
      });

      if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
      if (slot.isBooked) {
        return NextResponse.json({ error: 'This time slot has already been booked by another parent.' }, { status: 409 });
      }
      if (slot.isBlocked) {
        return NextResponse.json({ error: `This slot is currently unavailable (${slot.blockReason || 'Blocked'}).` }, { status: 400 });
      }

      // Conflict Prevention 1: Check if parent already has an appointment at the exact same date & time slot
      const existingParentBooking = await prisma.ptmBooking.findFirst({
        where: {
          parentId,
          scheduledDate: slot.slotDate,
          timeSlot: `${slot.startTime} - ${slot.endTime}`,
          status: { in: ['CONFIRMED', 'RESCHEDULED', 'IN_PROGRESS'] },
        },
        include: { teacher: { include: { user: true } } },
      });

      if (existingParentBooking) {
        return NextResponse.json({
          error: `Time conflict! You already have a confirmed meeting with ${existingParentBooking.teacher.user.firstName} at ${slot.startTime} - ${slot.endTime}. Please select another slot.`,
        }, { status: 409 });
      }

      // Conflict Prevention 2: Check if this student already has a booking with this specific teacher for this PTM Event
      if (slot.ptmEventId && studentId) {
        const duplicateStudentBooking = await prisma.ptmBooking.findFirst({
          where: {
            ptmEventId: slot.ptmEventId,
            studentId,
            teacherId: slot.teacherId,
            status: { in: ['CONFIRMED', 'RESCHEDULED', 'IN_PROGRESS'] },
          },
        });
        if (duplicateStudentBooking) {
          return NextResponse.json({
            error: 'An active appointment with this teacher has already been scheduled for this student in this PTM.',
          }, { status: 409 });
        }
      }

      // Mark slot as booked
      await prisma.ptmSlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      // Create Booking
      const booking = await prisma.ptmBooking.create({
        data: {
          ptmEventId: slot.ptmEventId || null,
          slotId: slot.id,
          parentId,
          studentId: studentId || null,
          teacherId: slot.teacherId,
          scheduledDate: slot.slotDate,
          timeSlot: `${slot.startTime} - ${slot.endTime}`,
          meetingMode: slot.meetingMode,
          roomNumber: slot.roomNumber,
          meetingLink: slot.meetingLink,
          notes: notes || 'General academic and behavioral consultation',
          status: 'CONFIRMED',
        },
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
        },
      });

      // Dispatch confirmation notifications
      await sendAutomatedNotification({
        userId: user.id,
        title: 'PTM Appointment Confirmed',
        message: `Your conference with ${booking.teacher.user.firstName} ${booking.teacher.user.lastName || ''} is scheduled for ${slot.startTime} - ${slot.endTime} on ${new Date(slot.slotDate).toLocaleDateString()}. Location: ${booking.roomNumber || 'Online'}`,
        type: 'PTM_SCHEDULED',
        channels: ['IN_APP'],
        link: '/dashboard/ptm',
      });

      await sendAutomatedNotification({
        userId: booking.teacher.user.id,
        title: 'New PTM Appointment Booked',
        message: `Parent ${booking.parent.user.firstName} has scheduled a PTM meeting for student ${booking.student?.user?.firstName || 'Student'} on ${new Date(slot.slotDate).toLocaleDateString()} at ${slot.startTime} - ${slot.endTime}.`,
        type: 'PTM_SCHEDULED',
        channels: ['IN_APP'],
        link: '/dashboard/ptm',
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'BOOK_PTM_SLOT',
        module: 'COMMUNICATION',
        recordId: booking.id,
        newValue: `Booked slot ${booking.timeSlot} with teacher ${booking.teacher.user.firstName}`,
      });

      return NextResponse.json({ success: true, booking });
    }

    // =========================================================================
    // 6. RESCHEDULE BOOKING
    // =========================================================================
    if (action === 'RESCHEDULE_BOOKING') {
      const { bookingId, newSlotId, rescheduleReason } = body;
      if (!bookingId || !newSlotId) {
        return NextResponse.json({ error: 'Booking ID and target slot ID required' }, { status: 400 });
      }

      const booking = await prisma.ptmBooking.findUnique({
        where: { id: bookingId },
        include: { slot: true, teacher: { include: { user: true } }, parent: { include: { user: true } } },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      // Check target slot
      const newSlot = await prisma.ptmSlot.findUnique({ where: { id: newSlotId } });
      if (!newSlot) return NextResponse.json({ error: 'Target slot not found' }, { status: 404 });
      if (newSlot.isBooked) return NextResponse.json({ error: 'Target slot is already booked.' }, { status: 409 });
      if (newSlot.isBlocked) return NextResponse.json({ error: 'Target slot is unavailable.' }, { status: 400 });

      // Free previous slot
      if (booking.slotId) {
        await prisma.ptmSlot.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      }

      // Claim new slot
      await prisma.ptmSlot.update({
        where: { id: newSlotId },
        data: { isBooked: true },
      });

      const oldTime = booking.timeSlot;
      const updatedBooking = await prisma.ptmBooking.update({
        where: { id: bookingId },
        data: {
          slotId: newSlot.id,
          scheduledDate: newSlot.slotDate,
          timeSlot: `${newSlot.startTime} - ${newSlot.endTime}`,
          meetingMode: newSlot.meetingMode,
          roomNumber: newSlot.roomNumber,
          meetingLink: newSlot.meetingLink,
          status: 'RESCHEDULED',
          rescheduledFromTime: oldTime,
        },
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
        },
      });

      // Notification
      await sendAutomatedNotification({
        userId: booking.parent.user.id,
        title: 'PTM Rescheduled',
        message: `Your meeting with ${booking.teacher.user.firstName} has been rescheduled to ${newSlot.startTime} - ${newSlot.endTime} on ${new Date(newSlot.slotDate).toLocaleDateString()}. Reason: ${rescheduleReason || 'Parent request'}`,
        type: 'PTM_RESCHEDULED',
        channels: ['IN_APP'],
        link: '/dashboard/ptm',
      });

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    // =========================================================================
    // 7. CANCEL APPOINTMENT
    // =========================================================================
    if (action === 'CANCEL_BOOKING') {
      const { bookingId, cancellationReason } = body;
      const booking = await prisma.ptmBooking.findUnique({
        where: { id: bookingId },
        include: { teacher: { include: { user: true } }, parent: { include: { user: true } } },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      // Release slot
      if (booking.slotId) {
        await prisma.ptmSlot.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      }

      const updated = await prisma.ptmBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: cancellationReason || 'Cancelled by attendee',
        },
      });

      // Notify other party
      const notifyUserId = isParent ? booking.teacher.user.id : booking.parent.user.id;
      await sendAutomatedNotification({
        userId: notifyUserId,
        title: 'PTM Appointment Cancelled',
        message: `The PTM meeting scheduled for ${booking.timeSlot} on ${new Date(booking.scheduledDate).toLocaleDateString()} has been cancelled. Reason: ${cancellationReason || 'Schedule conflict'}`,
        type: 'PTM_CANCELLED',
        channels: ['IN_APP'],
        link: '/dashboard/ptm',
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    // =========================================================================
    // 8. UPDATE MEETING STATUS (IN_PROGRESS, COMPLETED, NO_SHOW)
    // =========================================================================
    if (action === 'UPDATE_STATUS') {
      const { bookingId, status } = body;
      const updated = await prisma.ptmBooking.update({
        where: { id: bookingId },
        data: { status },
      });
      return NextResponse.json({ success: true, booking: updated });
    }

    // =========================================================================
    // 9. SAVE MEETING NOTES (TEACHER PRIVATE VS SHARED PARENT-VISIBLE)
    // =========================================================================
    if (action === 'SAVE_MEETING_NOTES') {
      // 🔒 SECURITY CHECK: Parents can NEVER modify teacher notes
      if (isParent && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden. Meeting notes can only be prepared by faculty or administration.' }, { status: 403 });
      }

      const { bookingId, sharedNotes, privateTeacherNotes, followUps } = body;
      if (!bookingId) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

      const booking = await prisma.ptmBooking.findUnique({
        where: { id: bookingId },
        include: { teacher: { include: { user: true } } },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      // Verify that if a teacher is editing, it's their own meeting (or admin)
      if (isTeacher && !isAdmin) {
        const myTeacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
        if (!myTeacher || myTeacher.id !== booking.teacherId) {
          return NextResponse.json({ error: 'Forbidden. You can only edit notes for your own meetings.' }, { status: 403 });
        }
      }

      const updated = await prisma.ptmBooking.update({
        where: { id: bookingId },
        data: {
          sharedNotes: sharedNotes !== undefined ? sharedNotes : undefined,
          privateTeacherNotes: privateTeacherNotes !== undefined ? privateTeacherNotes : undefined,
          notesRecordedAt: new Date(),
          notesRecordedByName: `${user.firstName} ${user.lastName || ''}`.trim(),
          status: 'COMPLETED',
        },
      });

      // Handle follow-up tasks if provided
      if (followUps && Array.isArray(followUps)) {
        for (const task of followUps) {
          if (task.id) {
            await prisma.ptmFollowUpTask.update({
              where: { id: task.id },
              data: {
                title: task.title,
                assignedTo: task.assignedTo || 'PARENT',
                status: task.status || 'PENDING',
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                notes: task.notes || null,
              },
            });
          } else if (task.title) {
            await prisma.ptmFollowUpTask.create({
              data: {
                bookingId,
                title: task.title,
                assignedTo: task.assignedTo || 'PARENT',
                status: task.status || 'PENDING',
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                notes: task.notes || null,
              },
            });
          }
        }
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // =========================================================================
    // 10. TOGGLE / UPDATE FOLLOW-UP TASK
    // =========================================================================
    if (action === 'UPDATE_FOLLOWUP_TASK') {
      const { taskId, status } = body;
      const updated = await prisma.ptmFollowUpTask.update({
        where: { id: taskId },
        data: { status },
      });
      return NextResponse.json({ success: true, task: updated });
    }

    // =========================================================================
    // 11. SEND REMINDER
    // =========================================================================
    if (action === 'SEND_REMINDER') {
      const { bookingId } = body;
      const booking = await prisma.ptmBooking.findUnique({
        where: { id: bookingId },
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
        },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      await sendAutomatedNotification({
        userId: booking.parent.user.id,
        title: 'PTM Meeting Reminder',
        message: `Reminder: Your PTM consultation with ${booking.teacher.user.firstName} for ${booking.student?.user?.firstName || 'your ward'} is coming up on ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.timeSlot}. Location: ${booking.roomNumber || booking.meetingLink || 'Room 204'}`,
        type: 'PTM_REMINDER',
        channels: ['IN_APP'],
        link: '/dashboard/ptm',
      });

      await prisma.ptmBooking.update({
        where: { id: bookingId },
        data: { reminderSent: true, reminderSentAt: new Date() },
      });

      return NextResponse.json({ success: true, message: 'Reminder dispatched successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('PTM POST API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
