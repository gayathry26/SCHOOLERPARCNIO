import { signToken, UserRole, SessionUser } from '../../lib/auth';
import { canAccessModule, AppModule } from '../../lib/permissions';

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'TEACHER',
  'CLASS_TEACHER',
  'ACCOUNTANT',
  'HR_MANAGER',
  'LIBRARIAN',
  'TRANSPORT_MANAGER',
  'TRANSPORT_STAFF',
  'COUNSELLOR',
  'NURSE',
  'STUDENT',
  'PARENT',
  'RECEPTIONIST',
];

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

async function runRoleAudit() {
  console.log('=== EDVONEST 16-ROLE INDEPENDENT PERMISSION AUDIT ===\n');

  const roleReport: Record<string, { allowedCount: number; deniedCount: number; unauthorizedPageAccess: string[] }> = {};

  for (const role of ALL_ROLES) {
    const userPayload: SessionUser = {
      id: `test-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@test.edvonest.com`,
      username: `test_${role.toLowerCase()}`,
      role,
      firstName: 'Audit',
      lastName: role,
      schoolId: 'edvonest-main-school',
    };

    const token = signToken(userPayload);
    const cookieHeader = `edvonest_session=${token}`;

    let allowedCount = 0;
    let deniedCount = 0;
    const unauthorizedPageAccess: string[] = [];

    for (const item of PAGES_AND_MODULES) {
      const isAllowedByRbac = canAccessModule(role, item.module);

      try {
        const res = await fetch(`http://127.0.0.1:3000${item.path}`, {
          headers: { cookie: cookieHeader },
          redirect: 'manual',
        });

        // If not allowed by RBAC, but page returned 200 without redirecting or blocking
        if (!isAllowedByRbac && res.status === 200) {
          unauthorizedPageAccess.push(`${item.path} (Module: ${item.module}) returned 200 instead of redirect/403`);
        }

        if (isAllowedByRbac) {
          allowedCount++;
        } else {
          deniedCount++;
        }
      } catch (err: any) {
        console.error(`Error requesting ${item.path}:`, err.message);
      }
    }

    roleReport[role] = { allowedCount, deniedCount, unauthorizedPageAccess };
    console.log(`Role: ${role} | Allowed Modules: ${allowedCount} | Denied: ${deniedCount}`);
    if (unauthorizedPageAccess.length > 0) {
      console.log(`  ⚠️ LEAK: ${unauthorizedPageAccess.length} unauthorized page(s) accessible!`);
      unauthorizedPageAccess.forEach(p => console.log(`     - ${p}`));
    } else {
      console.log(`  ✓ Perfectly isolated.`);
    }
  }

  return roleReport;
}

runRoleAudit().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
