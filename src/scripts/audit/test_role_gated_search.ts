async function testRoleGatedSearch() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Role-Gated Search & Command Menu Permissions...\n');

  // 1. Student Session
  const studentLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student1@edvonest.com', password: 'password123' }),
  });
  const studentCookie = studentLogin.headers.get('set-cookie')?.split(';')[0];

  if (!studentCookie) {
    console.error('Failed to get student session');
    return;
  }

  // Student searches for "fees"
  const studentFeeRes = await fetch(`${baseUrl}/api/search?q=fees`, {
    headers: { Cookie: studentCookie },
  });
  const studentFeeData = await studentFeeRes.json();
  console.log('Student search for "fees":', studentFeeData.results?.map((r: any) => `[${r.category}] ${r.title}`));

  // Student searches for "reports" (should NOT have access to Executive Reports)
  const studentReportRes = await fetch(`${baseUrl}/api/search?q=reports`, {
    headers: { Cookie: studentCookie },
  });
  const studentReportData = await studentReportRes.json();
  console.log('Student search for "reports" (Permission restricted):', studentReportData.results?.map((r: any) => `[${r.category}] ${r.title}`) || []);

  // Student searches for "Aarav" (Student role cannot search other students' directory)
  const studentAaravRes = await fetch(`${baseUrl}/api/search?q=Aarav`, {
    headers: { Cookie: studentCookie },
  });
  const studentAaravData = await studentAaravRes.json();
  console.log('Student search for "Aarav" (Directory access restricted):', studentAaravData.results?.length || 0, 'results');

  console.log('\nRole-based search permission verification complete!');
}

testRoleGatedSearch().catch(console.error);
