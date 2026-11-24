const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const currentAY = await prisma.academicYear.findFirst({
    where: { schoolId: 'edvonest-main-school', isCurrent: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Current Academic Year for edvonest-main-school:', currentAY);

  // Check all enrollments to see which classIds and sectionIds are actually in use
  const enrollments = await prisma.studentEnrollment.findMany({
    include: {
      class: true,
      section: true,
      student: { include: { user: true } }
    }
  });

  console.log(`\nActive student enrollments (${enrollments.length}):`);
  enrollments.forEach(e => {
    console.log(`- Student: ${e.student.user.firstName} ${e.student.user.lastName} (Adm: ${e.student.admissionNumber}) -> Class: "${e.class.name}" (ID: ${e.classId}), Section: "${e.section?.name}" (ID: ${e.sectionId})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
