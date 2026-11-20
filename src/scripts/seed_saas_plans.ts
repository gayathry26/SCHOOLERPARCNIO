import { prisma } from '../lib/db';

async function seedPlans() {
  console.log('Seeding SaaS Subscription Plans...');

  const plans = [
    {
      code: 'FREE_TRIAL',
      name: '14-Day Free Evaluation',
      description: 'Full evaluation environment for new institutions with test student batches.',
      pricePerYear: 0,
      pricePerMonth: 0,
      maxStudents: 200,
      maxStaff: 25,
      allowedModules: JSON.stringify([
        'STUDENTS',
        'ACADEMICS',
        'ATTENDANCE',
        'EXAMINATIONS',
        'COMMUNICATION',
        'DASHBOARD',
      ]),
      features: 'Full core module access, up to 200 students, standard email support',
      isPopular: false,
    },
    {
      code: 'BASIC',
      name: 'Essential School ERP',
      description: 'Ideal for primary and middle schools needing automated attendance, grades, and fee collection.',
      pricePerYear: 45000,
      pricePerMonth: 4500,
      maxStudents: 500,
      maxStaff: 50,
      allowedModules: JSON.stringify([
        'STUDENTS',
        'ACADEMICS',
        'ATTENDANCE',
        'EXAMINATIONS',
        'FEES_FINANCE',
        'COMMUNICATION',
        'REPORTS',
        'DASHBOARD',
        'CERTIFICATES',
      ]),
      features: 'Up to 500 students, automated fee invoices, report cards, WhatsApp alerts',
      isPopular: false,
    },
    {
      code: 'STANDARD',
      name: 'Comprehensive Campus Suite',
      description: 'Complete operating system for standard K-12 CBSE & ICSE schools with bus transport and clinic.',
      pricePerYear: 95000,
      pricePerMonth: 9500,
      maxStudents: 1500,
      maxStaff: 120,
      allowedModules: JSON.stringify([
        'STUDENTS',
        'ACADEMICS',
        'ATTENDANCE',
        'EXAMINATIONS',
        'FEES_FINANCE',
        'COMMUNICATION',
        'TRANSPORT',
        'LIBRARY',
        'HEALTH_CLINIC',
        'CAMPUS_SAFETY',
        'INVENTORY',
        'REPORTS',
        'CERTIFICATES',
        'DASHBOARD',
        'LIFECYCLE',
      ]),
      features: 'Up to 1,500 students, live bus GPS tracking, infirmary, QR campus safety',
      isPopular: true,
    },
    {
      code: 'PREMIUM',
      name: 'Enterprise AI Institutional OS',
      description: 'Next-generation intelligent school management with AI learning assistants, predictive alerts, and multi-campus.',
      pricePerYear: 185000,
      pricePerMonth: 18500,
      maxStudents: 5000,
      maxStaff: 400,
      allowedModules: 'ALL',
      features: 'Unlimited students & branches, AI study assistant, Academic Intelligence, Priority 24/7 SLA',
      isPopular: false,
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });
  }

  // Ensure default school has tenantCode MAIN
  const defaultSchool = await prisma.school.findFirst();
  if (defaultSchool) {
    await prisma.school.update({
      where: { id: defaultSchool.id },
      data: {
        tenantCode: 'MAIN',
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        status: 'ACTIVE',
        maxStudents: 5000,
        maxStaff: 400,
      },
    });

    // Create a sample subscription invoice for record
    const existingInv = await prisma.subscriptionInvoice.findFirst({
      where: { schoolId: defaultSchool.id },
    });
    if (!existingInv) {
      await prisma.subscriptionInvoice.create({
        data: {
          invoiceNumber: 'INV-EDV-2026-001',
          schoolId: defaultSchool.id,
          planCode: 'PREMIUM',
          amount: 185000,
          currency: 'INR',
          status: 'PAID',
          billingPeriod: 'Annual Session 2026-2027',
          dueDate: new Date(),
          paidAt: new Date(),
          paymentMethod: 'CORPORATE_NEFT',
          transactionRef: 'NEFT-RBIP-9842104921',
        },
      });
    }
  }

  console.log('✓ Successfully seeded 4 subscription plans & verified default school subscription.');
}

seedPlans()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
