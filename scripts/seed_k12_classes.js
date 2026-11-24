const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const K12_CLASSES = [
  { name: 'LKG', numericOrder: -2, stream: 'Kindergarten' },
  { name: 'UKG', numericOrder: -1, stream: 'Kindergarten' },
  { name: 'Class 1', numericOrder: 1, stream: 'Primary' },
  { name: 'Class 2', numericOrder: 2, stream: 'Primary' },
  { name: 'Class 3', numericOrder: 3, stream: 'Primary' },
  { name: 'Class 4', numericOrder: 4, stream: 'Primary' },
  { name: 'Class 5', numericOrder: 5, stream: 'Primary' },
  { name: 'Class 6', numericOrder: 6, stream: 'Middle School' },
  { name: 'Class 7', numericOrder: 7, stream: 'Middle School' },
  { name: 'Class 8', numericOrder: 8, stream: 'Middle School' },
  { name: 'Class 9', numericOrder: 9, stream: 'Secondary' },
  { name: 'Class 10', numericOrder: 10, stream: 'Secondary (CBSE)' },
  { name: 'Class 11', numericOrder: 11, stream: 'Senior Secondary (Science/Commerce)' },
  { name: 'Class 12', numericOrder: 12, stream: 'Senior Secondary (CBSE Board)' },
];

async function main() {
  const school = await prisma.school.findFirst({
    where: { id: 'edvonest-main-school' }
  });

  if (!school) {
    throw new Error('School edvonest-main-school not found!');
  }

  // Find or use current academic year
  let currentAY = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isCurrent: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Target School: ${school.name} (${school.id})`);
  console.log(`Target Academic Year: ${currentAY?.name} (${currentAY?.id})`);

  for (const cDef of K12_CLASSES) {
    // Check if class with this name exists for the school
    let existingClass = await prisma.class.findFirst({
      where: {
        schoolId: school.id,
        name: cDef.name,
      },
      include: {
        sections: true
      }
    });

    if (!existingClass) {
      existingClass = await prisma.class.create({
        data: {
          name: cDef.name,
          numericOrder: cDef.numericOrder,
          stream: cDef.stream,
          schoolId: school.id,
          academicYearId: currentAY?.id || null,
          isActive: true
        },
        include: { sections: true }
      });
      console.log(`[CREATED] Class: ${cDef.name} (ID: ${existingClass.id}, Order: ${cDef.numericOrder})`);
    } else {
      // Update numericOrder and stream to ensure correct hierarchy
      await prisma.class.update({
        where: { id: existingClass.id },
        data: {
          numericOrder: cDef.numericOrder,
          stream: cDef.stream,
          isActive: true
        }
      });
      console.log(`[EXISTS] Class: ${cDef.name} (ID: ${existingClass.id}, Order: ${cDef.numericOrder})`);
    }

    // Ensure Section A exists
    let sectionA = existingClass.sections.find(s => s.name === 'A');
    if (!sectionA) {
      sectionA = await prisma.section.create({
        data: {
          classId: existingClass.id,
          name: 'A',
          capacity: 40,
          isActive: true
        }
      });
      console.log(`   └─ Created Section A for ${cDef.name}`);
    }

    // Ensure Section B exists
    let sectionB = existingClass.sections.find(s => s.name === 'B');
    if (!sectionB) {
      sectionB = await prisma.section.create({
        data: {
          classId: existingClass.id,
          name: 'B',
          capacity: 40,
          isActive: true
        }
      });
      console.log(`   └─ Created Section B for ${cDef.name}`);
    }
  }

  console.log('\n--- VERIFICATION: All Classes from LKG to Class 12 ---');
  const allClasses = await prisma.class.findMany({
    where: { schoolId: school.id, isActive: true },
    orderBy: { numericOrder: 'asc' },
    include: {
      sections: true,
      _count: { select: { enrollments: true } }
    }
  });

  allClasses.forEach(c => {
    const secNames = c.sections.map(s => s.name).join(', ');
    console.log(`[${c.numericOrder}] ${c.name} (${c.stream}) -> Sections: [${secNames}] (Students: ${c._count.enrollments})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
