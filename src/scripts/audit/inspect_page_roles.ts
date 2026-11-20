import fs from 'fs';
import path from 'path';

const DASHBOARD_DIR = path.resolve('src/app/dashboard');

function getPageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getPageFiles(filePath, fileList);
    } else if (file.endsWith('page.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const pages = getPageFiles(DASHBOARD_DIR);
const results: { file: string; hasRoleCheck: boolean; codeSnippet: string }[] = [];

for (const p of pages) {
  const relPath = path.relative(process.cwd(), p).replace(/\\/g, '/');
  const content = fs.readFileSync(p, 'utf8');

  // Check if it checks role
  const hasRoleCheck = /user\.role|canAccessModule|hasPermission/i.test(content);

  results.push({
    file: relPath,
    hasRoleCheck,
    codeSnippet: content.slice(0, 300),
  });
}

console.log(JSON.stringify(results, null, 2));
