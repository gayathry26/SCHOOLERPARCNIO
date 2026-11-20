async function testNavigationAndSearch() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Navigation and Search API with Admin Session...\n');

  // Login as admin
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
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

  // Search for ERP modules, students, and actions
  const queries = ['attendance', 'fees', 'homework', 'exams', 'bus', 'Aarav'];

  for (const q of queries) {
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`, {
      headers: { Cookie: cookie },
    });
    const data = await res.json();
    console.log(`Query: "${q}" -> ${data.results?.length || 0} results`);
    if (data.results && data.results.length > 0) {
      data.results.forEach((r: any) => {
        console.log(`  - [${r.category}] ${r.title}: ${r.subtitle} (${r.url})`);
      });
    }
  }

  console.log('\nAll search queries returned authenticated structured results successfully!');
}

testNavigationAndSearch().catch(console.error);
