const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schoolId = 'edvonest-main-school';

  // Target primary classes
  const primaryClass10 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 10', stream: 'Secondary (CBSE)' },
    include: { sections: true }
  });
  const primaryClass9 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 9', stream: 'Secondary' },
    include: { sections: true }
  });
  const primaryClass11 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 11', stream: 'Senior Secondary (Science/Commerce)' },
    include: { sections: true }
  });

  // Find duplicate classes with stream 'General' or other
  const duplicateClass10 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 10', stream: 'General' },
    include: { sections: { include: { enrollments: true } } }
  });
  if (duplicateClass10) {
    console.log(`Deactivating duplicate Class 10 (${duplicateClass10.id})...`);
    // Re-link any enrollment to primary class 10 Section A
    const secA = primaryClass10.sections.find(s => s.name === 'A');
    for (const sec of duplicateClass10.sections) {
      for (const enr of sec.enrollments) {
        // If already enrolled in primary, delete duplicate enrollment
        const existing = await prisma.studentEnrollment.findFirst({
          where: { studentId: enr.studentId, classId: primaryClass10.id }
        });
        if (existing) {
          await prisma.studentEnrollment.delete({ where: { id: enr.id } });
        } else {
          await prisma.studentEnrollment.update({
            where: { id: enr.id },
            data: { classId: primaryClass10.id, sectionId: secA.id }
          });
        }
      }
    }
    await prisma.class.update({
      where: { id: duplicateClass10.id },
      data: { isActive: false }
    });
  }

  const duplicateClass9 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 9', stream: 'General' }
  });
  if (duplicateClass9) {
    console.log(`Deactivating duplicate Class 9 (${duplicateClass9.id})...`);
    await prisma.class.update({
      where: { id: duplicateClass9.id },
      data: { isActive: false }
    });
  }

  const duplicateClass11 = await prisma.class.findFirst({
    where: { schoolId, name: 'Class 11', stream: 'Science (PCM/PCB)' }
  });
  if (duplicateClass11) {
    console.log(`Deactivating duplicate Class 11 (${duplicateClass11.id})...`);
    await prisma.class.update({
      where: { id: duplicateClass11.id },
      data: { isActive: false }
    });
  }

  console.log('Duplicate cleanup complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
