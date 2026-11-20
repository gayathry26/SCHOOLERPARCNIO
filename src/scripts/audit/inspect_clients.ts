import fs from 'fs';
import path from 'path';

const DASHBOARD_DIR = path.resolve('src/app/dashboard');

function getTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

interface ComponentAuditResult {
  file: string;
  hasDummyData: boolean;
  dummyDataMatches: string[];
  emptyHandlers: string[];
  alertCalls: string[];
  hasFormWithoutSubmit: boolean;
  hasSearchFilter: boolean;
  searchFilterFunctional: boolean;
  missingEmptyState: boolean;
}

const files = getTsxFiles(DASHBOARD_DIR);
const results: ComponentAuditResult[] = [];

for (const file of files) {
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // Check for dummy / mock data declarations
  const dummyMatches: string[] = [];
  const dummyRegex = /const\s+([A-Za-z0-9_]*(mock|dummy|fake|sample|DEMO)[A-Za-z0-9_]*)\s*=/gi;
  let match;
  while ((match = dummyRegex.exec(content)) !== null) {
    dummyMatches.push(match[1]);
  }

  // Check for empty handlers: onClick={() => {}} or onClick={() => void 0}
  const emptyHandlers: string[] = [];
  const emptyHandlerRegex = /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g;
  if (emptyHandlerRegex.test(content)) {
    emptyHandlers.push('onClick={() => {}}');
  }

  // Check for alert calls
  const alertCalls: string[] = [];
  const alertRegex = /alert\s*\(\s*['"`](.*?)['"`]\s*\)/g;
  let alertMatch;
  while ((alertMatch = alertRegex.exec(content)) !== null) {
    alertCalls.push(alertMatch[1]);
  }

  // Check if form has onSubmit
  const hasForm = /<form/i.test(content);
  const hasOnSubmit = /onSubmit\s*=/i.test(content);
  const hasFormWithoutSubmit = hasForm && !hasOnSubmit;

  // Search / filter check
  const hasSearchFilter = /search|filter/i.test(content);
  const searchFilterFunctional = /toLowerCase\(\)\.includes|\.filter\(/i.test(content);

  // Missing empty state
  const hasListOrTable = /<table|<DataTable|\.map\(/i.test(content);
  const hasEmptyCheck = /length\s*===?\s*0|\!.*?\.length|No\s+.*?found|EmptyState|no\s+records/i.test(content);
  const missingEmptyState = hasListOrTable && !hasEmptyCheck && !relPath.includes('layout') && !relPath.includes('Widget');

  results.push({
    file: relPath,
    hasDummyData: dummyMatches.length > 0,
    dummyDataMatches: dummyMatches,
    emptyHandlers,
    alertCalls,
    hasFormWithoutSubmit,
    hasSearchFilter,
    searchFilterFunctional,
    missingEmptyState,
  });
}

console.log(JSON.stringify(results, null, 2));
