import { prisma } from '../../lib/db';
import { signToken, SessionUser, UserRole } from '../../lib/auth';
import { canAccessModule, AppModule } from '../../lib/permissions';

const PAGES_AND_MODULES: { path: string; module: AppModule }[] = [
  { path: '/dashboard', module: 'DASHBOARD' },
  { path: '/dashboard/command-centre', module: 'COMMAND_CENTRE' },
  { path: '/dashboard/students', module: 'STUDENTS' },
  { path: '/dashboard/academic-intelligence', module: 'ACADEMIC_INTELLIGENCE' },
  { path: '/dashboard/ai-learning', module: 'AI_LEARNING' },
  { path: '/dashboard/question-bank', module: 'QUESTION_BANK' },
  { path: '/dashboard/lesson-plans', module: 'LESSON_PLANS' },
  { path: '/dashboard/campus-safety', module: 'CAMPUS_SAFETY' },
  { path: '/dashboard/transport', module: 'TRANSPORT' },
  { path: '/dashboard/health', module: 'HEALTH_CLINIC' },
  { path: '/dashboard/admissions', module: 'ADMISSIONS' },
  { path: '/dashboard/portfolio', module: 'STUDENT_PORTFOLIO' },
  { path: '/dashboard/parent-portal', module: 'PARENT_PORTAL' },
  { path: '/dashboard/inventory', module: 'INVENTORY' },
  { path: '/dashboard/hr', module: 'HR_MANAGEMENT' },
  { path: '/dashboard/fees', module: 'FEES_FINANCE' },
  { path: '/dashboard/finance', module: 'FEES_FINANCE' },
  { path: '/dashboard/events', module: 'EVENTS' },
  { path: '/dashboard/certificates', module: 'CERTIFICATES' },
  { path: '/dashboard/multi-campus', module: 'MULTI_CAMPUS' },
  { path: '/dashboard/reports', module: 'REPORTS' },
  { path: '/dashboard/settings', module: 'SETTINGS' },
  { path: '/dashboard/audit-logs', module: 'AUDIT_LOGS' },
];

async function run() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in DB.`);

  for (const user of users) {
    const role = user.role as UserRole;
    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role,
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
    });

    const leaks: string[] = [];

    for (const item of PAGES_AND_MODULES) {
      const allowed = canAccessModule(role, item.module);
      const res = await fetch(`http://127.0.0.1:3000${item.path}`, {
        headers: { cookie: `edvonest_session=${token}` },
        redirect: 'manual',
      });

      // If user is NOT allowed to access this module, but the page returned 200 (not redirected to /dashboard or /login)
      if (!allowed && res.status === 200) {
        leaks.push(`${item.path} (Module: ${item.module})`);
      }
    }

    console.log(`[${role}] ${user.email}: ${leaks.length > 0 ? `⚠️ LEAKED: ${leaks.join(', ')}` : '✓ OK'}`);
  }
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
