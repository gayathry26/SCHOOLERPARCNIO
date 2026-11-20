import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next') && !p.includes('audit')) {
        walk(p, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(p);
    }
  }
  return fileList;
}

const allFiles = walk('src');
const findings: { file: string; line: number; text: string; issue: string }[] = [];

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for user.name
    if (/\buser\??\.name\b/.test(line) && !line.includes('user.firstName') && !line.includes('name?:')) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'user.name used instead of user.firstName + user.lastName',
      });
    }

    // Check for student.classSection
    if (/\bclassSection\b/.test(line)) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'classSection used on StudentProfile (should be enrollments[0].class / section)',
      });
    }

    // Check for netPayable on salary slip
    if (/\bnetPayable\b/.test(line)) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'netPayable used instead of netSalary on StaffSalarySlip',
      });
    }

    // Check for busNumber (should be vehicleNumber on Vehicle)
    if (/\bvehicle\??\.busNumber\b/.test(line) || /\bv\.busNumber\b/.test(line) || /\broute\.vehicle\??\.busNumber\b/.test(line)) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'busNumber accessed on Vehicle (should be vehicleNumber)',
      });
    }

    // Check for empty or broken href
    if (/href\s*=\s*['"]#['"]/.test(line)) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'Dummy anchor link href="#" (non-functional navigation)',
      });
    }

    // Check for alert() calls
    if (/\balert\s*\(/.test(line) && !line.includes('//')) {
      findings.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: trimmed,
        issue: 'Browser alert() used instead of in-app toast / error notification',
      });
    }
  });
}

console.log(JSON.stringify(findings, null, 2));
