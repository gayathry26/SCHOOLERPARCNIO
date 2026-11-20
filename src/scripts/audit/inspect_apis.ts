import fs from 'fs';
import path from 'path';

const API_DIR = path.resolve('src/app/api');

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('route.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

interface ApiAuditResult {
  route: string;
  methods: string[];
  hasAuthCheck: boolean;
  hasRbacCheck: boolean;
  hasDbMutation: boolean;
  hasDbRead: boolean;
  hasAuditLog: boolean;
  hasHardcodedData: boolean;
  issues: string[];
}

const allRoutes = getFiles(API_DIR);
const results: ApiAuditResult[] = [];

for (const file of allRoutes) {
  const relPath = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf8');

  // Detect methods
  const methods: string[] = [];
  if (/export\s+async\s+function\s+GET/i.test(content)) methods.push('GET');
  if (/export\s+async\s+function\s+POST/i.test(content)) methods.push('POST');
  if (/export\s+async\s+function\s+PUT/i.test(content)) methods.push('PUT');
  if (/export\s+async\s+function\s+PATCH/i.test(content)) methods.push('PATCH');
  if (/export\s+async\s+function\s+DELETE/i.test(content)) methods.push('DELETE');

  const hasAuthCheck = /getCurrentUser|verifyToken|auth\(|session/i.test(content);
  const hasRbacCheck = /hasPermission|canAccessModule|\.role\s*===|\.role\s*!==|includes\(.*role/i.test(content);
  const hasDbMutation = /prisma\.\w+\.(create|update|delete|upsert|createMany|updateMany|deleteMany)/i.test(content);
  const hasDbRead = /prisma\.\w+\.(find|count|aggregate|groupBy)/i.test(content);
  const hasAuditLog = /logAudit|AuditLog/i.test(content);
  const hasHardcodedData = /const\s+mock|const\s+DUMMY|return\s+NextResponse\.json\(\s*\[\s*\{/i.test(content);

  const issues: string[] = [];

  // Exclude public auth routes from auth check requirement
  const isAuthRoute = relPath.includes('api\\auth\\') || relPath.includes('api/auth/');
  if (!isAuthRoute && !hasAuthCheck) {
    issues.push('Missing authentication check (unauthenticated requests allowed)');
  }
  if (!isAuthRoute && !hasRbacCheck && methods.some(m => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(m))) {
    issues.push('Missing RBAC check on mutating methods');
  }
  if (methods.some(m => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(m)) && !hasDbMutation) {
    issues.push('Mutating method does not perform Prisma DB mutation (may not persist data)');
  }
  if (hasDbMutation && !hasAuditLog) {
    issues.push('Performs DB mutation but does not log to AuditLog');
  }

  results.push({
    route: relPath.replace(/\\/g, '/'),
    methods,
    hasAuthCheck,
    hasRbacCheck,
    hasDbMutation,
    hasDbRead,
    hasAuditLog,
    hasHardcodedData,
    issues,
  });
}

console.log(JSON.stringify(results, null, 2));
