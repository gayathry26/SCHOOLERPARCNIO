async function verifySaasPage() {
  // 1. Login as Super Admin
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@edvonest.com', password: 'password123' }),
  });
  console.log('Super Admin login status:', loginRes.status);
  const cookie = loginRes.headers.get('set-cookie');

  // 2. Fetch /dashboard/platform-admin
  const pageRes = await fetch('http://localhost:3000/dashboard/platform-admin', {
    headers: { Cookie: cookie || '' },
  });
  console.log('Platform Admin page HTTP status:', pageRes.status);

  // 3. Fetch /api/saas
  const apiRes = await fetch('http://localhost:3000/api/saas', {
    headers: { Cookie: cookie || '' },
  });
  console.log('SaaS API GET HTTP status:', apiRes.status);
  const apiData = await apiRes.json();
  console.log(`- Retrieved ${apiData.schools?.length} schools from SaaS API.`);
  console.log(`- KPIs: ${apiData.kpis?.totalSchools} schools, ${apiData.kpis?.totalPlatformStudents} total students.`);
}

verifySaasPage().catch(console.error);
