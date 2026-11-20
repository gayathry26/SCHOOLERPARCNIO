async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edvonest.com', password: 'password123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  const pageRes = await fetch('http://localhost:3000/dashboard/lifecycle', {
    headers: { Cookie: cookie || '' }
  });
  console.log('Login status:', loginRes.status);
  console.log('Lifecycle page HTTP status for Admin:', pageRes.status);
}

test().catch(console.error);
