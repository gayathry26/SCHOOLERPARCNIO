import { prisma } from '../../lib/prisma';

async function seedPtmData() {
  console.log('--- Seeding PTM & Appointment Scheduling Data ---');

  const school = await prisma.school.findFirst() || await prisma.school.create({
    data: { id: 'edvonest-main-school', name: 'Edvonest Model International Academy' }
  });

  const teachers = await prisma.teacherProfile.findMany({
    include: { user: true },
    take: 5,
  });

  const parents = await prisma.parentProfile.findMany({
    include: {
      user: true,
      students: { include: { student: { include: { user: true, enrollments: { include: { class: true, section: true } } } } } },
    },
    take: 5,
  });

  const classes = await prisma.class.findMany({ take: 5 });

  console.log(`Found ${teachers.length} teachers, ${parents.length} parents, ${classes.length} classes.`);

  if (teachers.length === 0 || parents.length === 0) {
    console.log('Skipping detailed seed - insufficient teachers or parents.');
    return;
  }

  // 1. Create School-Wide PTM Events
  const nextSaturday = new Date();
  nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
  nextSaturday.setHours(9, 0, 0, 0);

  const event1 = await prisma.ptmEvent.upsert({
    where: { id: 'ptm-event-term2-mid' },
    update: {},
    create: {
      id: 'ptm-event-term2-mid',
      schoolId: school.id,
      title: 'Term 2 Mid-Semester Comprehensive PTM',
      description: 'Individual consultations on formative academic performance, attendance trends, and behavioral development.',
      eventDate: nextSaturday,
      startTime: '09:00 AM',
      endTime: '02:00 PM',
      slotDuration: 15,
      bufferTime: 5,
      targetClassIds: classes.map(c => c.id).join(','),
      status: 'OPEN_FOR_BOOKING',
      meetingMode: 'HYBRID',
      locationRoom: 'Respective Classrooms & Senior Wing Hall',
      defaultMeetingLink: 'https://meet.google.com/edv-ptm-term2',
      allowSubjectTeacherChoice: true,
      bookingDeadline: new Date(nextSaturday.getTime() - 86400000 * 2),
    },
  });

  const futurePtm = new Date(nextSaturday.getTime() + 86400000 * 14);
  const event2 = await prisma.ptmEvent.upsert({
    where: { id: 'ptm-event-cbse-board' },
    update: {},
    create: {
      id: 'ptm-event-cbse-board',
      schoolId: school.id,
      title: 'Class 10 & 12 Board Readiness Consultation Meet',
      description: 'Pre-board analysis, sample paper performance evaluation, and time management coaching with subject specialists.',
      eventDate: futurePtm,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      slotDuration: 20,
      bufferTime: 5,
      targetClassIds: classes[0]?.id || 'ALL',
      status: 'OPEN_FOR_BOOKING',
      meetingMode: 'IN_PERSON',
      locationRoom: 'Senior Physics Lab & Auditorium Lobby',
      allowSubjectTeacherChoice: true,
      bookingDeadline: new Date(futurePtm.getTime() - 86400000 * 3),
    },
  });

  console.log(`✅ Created PTM Events: "${event1.title}" and "${event2.title}"`);

  // 2. Generate Time Slots for Teachers
  const timeSlotTemplates = [
    { start: '09:00 AM', end: '09:15 AM' },
    { start: '09:20 AM', end: '09:35 AM' },
    { start: '09:40 AM', end: '09:55 AM' },
    { start: '10:00 AM', end: '10:15 AM' },
    { start: '10:20 AM', end: '10:35 AM' },
    { start: '10:40 AM', end: '10:55 AM' },
    { start: '11:00 AM', end: '11:15 AM' },
    { start: '11:20 AM', end: '11:35 AM' },
  ];

  for (const teacher of teachers) {
    for (let i = 0; i < timeSlotTemplates.length; i++) {
      const tmpl = timeSlotTemplates[i];
      const slotId = `slot-${event1.id}-${teacher.id}-${i}`;
      await prisma.ptmSlot.upsert({
        where: { id: slotId },
        update: {},
        create: {
          id: slotId,
          ptmEventId: event1.id,
          teacherId: teacher.id,
          slotDate: nextSaturday,
          startTime: tmpl.start,
          endTime: tmpl.end,
          meetingMode: i % 2 === 0 ? 'IN_PERSON' : 'ONLINE_VIDEO',
          roomNumber: `Room 20${(i % 5) + 1}`,
          meetingLink: i % 2 !== 0 ? `https://meet.google.com/edv-${teacher.employeeCode.toLowerCase()}` : null,
          isBooked: false,
          isBlocked: false,
        },
      });
    }
  }
  console.log(`✅ Configured time slots for ${teachers.length} teachers.`);

  // 3. Create Sample Bookings with Confidential Teacher Notes vs Shared Notes
  const parent1 = parents[0];
  const teacher1 = teachers[0];
  const student1 = parent1?.students[0]?.student;

  if (parent1 && teacher1 && student1) {
    const slotToBook = await prisma.ptmSlot.findFirst({
      where: { ptmEventId: event1.id, teacherId: teacher1.id, isBooked: false },
    });

    if (slotToBook) {
      await prisma.ptmSlot.update({
        where: { id: slotToBook.id },
        data: { isBooked: true },
      });

      const booking1 = await prisma.ptmBooking.upsert({
        where: { id: 'ptm-bk-sample-1' },
        update: {},
        create: {
          id: 'ptm-bk-sample-1',
          ptmEventId: event1.id,
          slotId: slotToBook.id,
          parentId: parent1.id,
          teacherId: teacher1.id,
          studentId: student1.id,
          scheduledDate: nextSaturday,
          timeSlot: `${slotToBook.startTime} - ${slotToBook.endTime}`,
          meetingMode: slotToBook.meetingMode,
          roomNumber: slotToBook.roomNumber,
          meetingLink: slotToBook.meetingLink,
          status: 'CONFIRMED',
          notes: 'Parent inquiry regarding math conceptual clarity and upcoming unit test preparation.',
          sharedNotes: 'Discussed student’s keen interest in Geometry. Advised 20 minutes daily practice on word problems. Great classroom participation and regular homework completion.',
          privateTeacherNotes: 'CONFIDENTIAL: Student shows signs of exam anxiety during timed assessments. Spoke with school counselor Ms. Ritu; plan to conduct discreet 1-on-1 mock quiz next Tuesday without putting pressure. Avoid raising panic with parents yet.',
          notesRecordedAt: new Date(),
          notesRecordedByName: `${teacher1.user.firstName} ${teacher1.user.lastName || ''}`,
          followUps: {
            create: [
              {
                title: 'Parent to verify daily geometry practice notebook',
                assignedTo: 'PARENT',
                status: 'IN_PROGRESS',
                dueDate: new Date(nextSaturday.getTime() + 86400000 * 7),
                notes: 'Review chapter 6 solved exercises',
              },
              {
                title: 'Teacher to provide remedial formula reference sheet',
                assignedTo: 'TEACHER',
                status: 'COMPLETED',
                dueDate: new Date(nextSaturday.getTime() + 86400000 * 2),
                notes: 'Handed over printed formula chart to student',
              },
            ],
          },
        },
      });
      console.log(`✅ Created Confirmed Booking with Private/Shared Notes: ${booking1.id}`);
    }
  }

  // Second sample booking (Completed)
  if (parents[1] && teachers[1]) {
    const parent2 = parents[1];
    const teacher2 = teachers[1];
    const student2 = parent2?.students[0]?.student;

    const slotToBook2 = await prisma.ptmSlot.findFirst({
      where: { ptmEventId: event1.id, teacherId: teacher2.id, isBooked: false },
    });

    if (slotToBook2) {
      await prisma.ptmSlot.update({
        where: { id: slotToBook2.id },
        data: { isBooked: true },
      });

      await prisma.ptmBooking.upsert({
        where: { id: 'ptm-bk-sample-2' },
        update: {},
        create: {
          id: 'ptm-bk-sample-2',
          ptmEventId: event1.id,
          slotId: slotToBook2.id,
          parentId: parent2.id,
          teacherId: teacher2.id,
          studentId: student2 ? student2.id : null,
          scheduledDate: nextSaturday,
          timeSlot: `${slotToBook2.startTime} - ${slotToBook2.endTime}`,
          meetingMode: 'ONLINE_VIDEO',
          meetingLink: 'https://meet.google.com/edv-science-room',
          status: 'CONFIRMED',
          notes: 'Discussion on lab practicals and science fair exhibition project.',
          sharedNotes: 'Student has chosen an innovative solar-powered distillation project. Commended for active participation in the Science Olympiad.',
          privateTeacherNotes: 'CONFIDENTIAL: Student occasionally forgets lab safety goggles. Reminded twice. Keep observation during next titration practical.',
          notesRecordedAt: new Date(),
          notesRecordedByName: `${teacher2.user.firstName} ${teacher2.user.lastName || ''}`,
        },
      });
      console.log('✅ Created Second Sample Booking.');
    }
  }

  console.log('🎉 PTM Data seeding completed successfully in MySQL!');
}

seedPtmData()
  .catch((e) => {
    console.error('❌ PTM Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
