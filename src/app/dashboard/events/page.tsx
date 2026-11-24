import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { EventsClient } from './EventsClient';

export default async function EventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'EVENTS')) redirect('/dashboard');

  const [events, exams, homework, ptm, leaves, timetable, classes, students] = await Promise.all([
    prisma.schoolEvent.findMany({
      include: {
        participants: {
          include: {
            student: {
              include: {
                user: true,
                enrollments: { include: { class: true, section: true } },
              },
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
    prisma.timetableEntry.findMany({
      include: {
        section: { include: { class: true } },
        subject: true,
        teacher: { include: { user: true } },
      },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      include: { sections: { where: { isActive: true } } },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: { include: { class: true, section: true } },
      },
      take: 100,
    }),
  ]);

  return (
    <EventsClient
      initialEvents={events}
      initialExams={exams}
      initialHomework={homework}
      initialPtm={ptm}
      initialLeaves={leaves}
      initialTimetable={timetable}
      classes={classes}
      students={students}
      currentUser={user}
    />
  );
}
