async function runPagesAudit() {
  console.log('================================================================');
  console.log('AUDITING ALL ERP DASHBOARD PAGES FOR ACCESSIBILITY & 200 OK');
  console.log('================================================================\n');

  // Login as admin
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edvonest.com', password: 'password123' }),
  });

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    console.error('Failed to get session cookie');
    process.exit(1);
  }
  const cookie = setCookie.split(';')[0];

  const PAGES = [
    '/dashboard',
    '/dashboard/students',
    '/dashboard/academics',
    '/dashboard/academic-intelligence',
    '/dashboard/ai-learning',
    '/dashboard/attendance',
    '/dashboard/timetable',
    '/dashboard/homework',
    '/dashboard/exams',
    '/dashboard/fees',
    '/dashboard/finance',
    '/dashboard/lifecycle',
    '/dashboard/hr',
    '/dashboard/transport',
    '/dashboard/library',
    '/dashboard/health',
    '/dashboard/campus-safety',
    '/dashboard/communication',
    '/dashboard/parent-portal',
    '/dashboard/events',
    '/dashboard/settings',
    '/dashboard/platform-admin',
    '/dashboard/audit-logs',
    '/dashboard/command-centre',
    '/dashboard/reports',
  ];

  let passed = 0;
  let failed = 0;

  for (const page of PAGES) {
    try {
      const res = await fetch(`http://localhost:3000${page}`, {
        headers: { Cookie: cookie },
      });

      if (res.status === 200) {
        const text = await res.text();
        const hasBreadcrumb = text.includes('Breadcrumb') || text.includes('Home');
        const hasHeader = text.includes('Active Session:');
        console.log(`✅ [200 OK] ${page.padEnd(35)} (Breadcrumbs: ${hasBreadcrumb ? 'Yes' : 'No'}, Header: ${hasHeader ? 'Yes' : 'No'})`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${page} returned status ${res.status}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`❌ [FAIL] ${page} exception:`, e.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`FULL SITE AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runPagesAudit();
