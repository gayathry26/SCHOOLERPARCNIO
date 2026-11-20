async function testGuards() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edvonest.com', password: 'password123' }),
  });
  const cookie = loginRes.headers.get('set-cookie');

  // Attempt to hit /api/saas as School Admin
  const apiRes = await fetch('http://localhost:3000/api/saas', {
    headers: { Cookie: cookie || '' },
  });
  console.log('SaaS API status for School Admin (expecting 403):', apiRes.status);

  // Attempt to hit /dashboard/platform-admin as School Admin (redirect: 'manual')
  const pageRes = await fetch('http://localhost:3000/dashboard/platform-admin', {
    headers: { Cookie: cookie || '' },
    redirect: 'manual',
  });
  console.log('Platform Admin page status for School Admin (expecting 307 redirect):', pageRes.status);
  console.log('Redirect location:', pageRes.headers.get('location'));
}

testGuards().catch(console.error);
