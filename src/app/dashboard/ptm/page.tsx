import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { PtmClient } from './PtmClient';

export default async function PtmPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'PTM_MANAGEMENT')) redirect('/dashboard');

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

  const [events, allTeachers, classes, rawBookings, slots] = await Promise.all([
    prisma.ptmEvent.findMany({
      orderBy: { eventDate: 'desc' },
      include: {
        _count: {
          select: { bookings: true, slots: true },
        },
      },
    }),
    prisma.teacherProfile.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      include: { sections: { where: { isActive: true } } },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.ptmBooking.findMany({
      where:
        isParent && parentProfile
          ? { parentId: parentProfile.id }
          : isTeacher && teacherProfile
          ? { teacherId: teacherProfile.id }
          : {},
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
    }),
    prisma.ptmSlot.findMany({
      include: {
        teacher: { include: { user: true } },
        ptmEvent: true,
      },
      orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
    }),
  ]);

  // 🔒 CRITICAL PRIVACY CONTROL:
  // If the requesting user is a PARENT or STUDENT, STRIP 'privateTeacherNotes'
  const bookings = rawBookings.map((b) => {
    if (isParent || user.role === 'STUDENT') {
      const { privateTeacherNotes, ...sanitized } = b;
      return sanitized;
    }
    return b;
  });

  return (
    <PtmClient
      initialEvents={events}
      initialBookings={bookings}
      initialSlots={slots}
      teachers={allTeachers}
      classes={classes}
      currentUser={user}
      currentUserProfile={{
        isParent,
        isTeacher,
        isAdmin,
        parentProfile,
        teacherProfile,
      }}
    />
  );
}
