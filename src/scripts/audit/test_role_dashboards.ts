import { ROLES_LIST } from '@/components/layout/RoleSwitcher';

interface RoleTest {
  role: string;
  email: string;
  expectedKeyword: string;
}

const TESTS: RoleTest[] = [
  {
    role: 'SCHOOL_ADMIN',
    email: 'admin@edvonest.com',
    expectedKeyword: 'Administrative Fast-Actions',
  },
  {
    role: 'PRINCIPAL',
    email: 'principal@edvonest.com',
    expectedKeyword: 'Executive Briefing',
  },
  {
    role: 'TEACHER',
    email: 'teacher.math@edvonest.com',
    expectedKeyword: 'Teacher Everyday Workflows',
  },
  {
    role: 'ACCOUNTANT',
    email: 'accountant@edvonest.com',
    expectedKeyword: 'Counter Inflow',
  },
  {
    role: 'STUDENT',
    email: 'student1@edvonest.com',
    expectedKeyword: 'AI Study Assistant',
  },
  {
    role: 'PARENT',
    email: 'parent1@edvonest.com',
    expectedKeyword: 'Live School Transport',
  },
];

async function runDashboardAudit() {
  console.log('================================================================');
  console.log('AUDITING ROLE-TAILORED DASHBOARD RENDERING & UX TRANSFORMATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of TESTS) {
    try {
      // Step 1: Login
      const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: t.email, password: 'password123' }),
      });

      if (!loginRes.ok) {
        console.error(`❌ [FAIL] ${t.role} login failed with status ${loginRes.status}`);
        failed++;
        continue;
      }

      // Extract set-cookie
      const setCookie = loginRes.headers.get('set-cookie');
      if (!setCookie) {
        console.error(`❌ [FAIL] ${t.role} received no session cookie`);
        failed++;
        continue;
      }

      const cookieVal = setCookie.split(';')[0];

      // Step 2: Fetch dashboard
      const dashRes = await fetch('http://localhost:3000/dashboard', {
        headers: { Cookie: cookieVal },
      });

      if (dashRes.status !== 200) {
        console.error(`❌ [FAIL] ${t.role} dashboard GET returned status ${dashRes.status}`);
        failed++;
        continue;
      }

      const html = await dashRes.text();

      // Check breadcrumbs and navigation
      const hasBreadcrumbs = html.includes('Breadcrumb') || html.includes('aria-label="Breadcrumb"') || html.includes('Home');
      const hasBrand = html.includes('EdvoNest') || html.includes('Learn • Grow • Succeed');
      const hasTailoredContent = html.includes(t.expectedKeyword);

      if (!hasTailoredContent) {
        console.error(`❌ [FAIL] ${t.role} dashboard missing expected role content: "${t.expectedKeyword}"`);
        failed++;
        continue;
      }

      console.log(`✅ [PASS] ${t.role}: Role-tailored dashboard rendered (verified "${t.expectedKeyword}") [Status: ${dashRes.status}]`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${t.role} test threw error:`, err.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`DASHBOARD UX AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runDashboardAudit();
