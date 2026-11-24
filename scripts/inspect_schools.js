const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, tenantCode: true }
  });
  console.log('Schools:', schools);

  const academicYears = await prisma.academicYear.findMany({
    select: { id: true, name: true, isCurrent: true, schoolId: true }
  });
  console.log('Academic Years:', academicYears);

  const classes = await prisma.class.findMany({
    select: { id: true, name: true, numericOrder: true, stream: true, schoolId: true, academicYearId: true }
  });
  console.log('Classes count:', classes.length);
  console.log(classes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
