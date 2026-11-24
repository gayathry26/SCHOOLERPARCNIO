import { prisma } from '../src/lib/db';

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      sections: {
        include: {
          classTeacher: { include: { user: true } },
          _count: { select: { enrollments: true } },
        },
      },
      academicYear: true,
    },
  });

  console.log(`Found ${classes.length} classes:`);
  for (const c of classes) {
    console.log(`Class: ${c.name} (${c.stream}) - ${c.sections.length} sections`);
    for (const s of c.sections) {
      const teacherName = s.classTeacher?.user ? `${s.classTeacher.user.firstName} ${s.classTeacher.user.lastName}` : 'None';
      console.log(`  Section: ${s.name} | Room: ${s.roomNo} | Teacher: ${teacherName} | Students: ${s._count.enrollments}`);
    }
  }

  const teachers = await prisma.teacherProfile.findMany({
    include: { user: true },
  });
  console.log(`Found ${teachers.length} teachers:`);
  for (const t of teachers) {
    console.log(`  Teacher: ${t.user.firstName} ${t.user.lastName} (${t.employeeCode}) [${t.id}]`);
  }
}

main().finally(() => prisma.$disconnect());
