const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    orderBy: { numericOrder: 'asc' },
    include: {
      sections: {
        include: {
          classTeacher: {
            include: {
              user: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      }
    }
  });

  console.log(`Total Classes: ${classes.length}`);
  classes.forEach(c => {
    console.log(`[Order: ${c.numericOrder}] Class: "${c.name}" (ID: ${c.id}, Active: ${c.isActive})`);
    c.sections.forEach(s => {
      const adv = s.classTeacher?.user ? `${s.classTeacher.user.firstName} ${s.classTeacher.user.lastName}` : 'Unassigned';
      console.log(`   └─ Section "${s.name}" (ID: ${s.id}, Cap: ${s.capacity}, Enrolled: ${s._count.enrollments}, Advisor: ${adv})`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
