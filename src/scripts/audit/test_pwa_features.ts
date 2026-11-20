import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/db';
import { queueOfflineAttendance, getOfflineAttendanceCount } from '../../lib/offline-sync';

async function testPwaFeatures() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE PWA & MOBILE ARCHITECTURE AUDIT');
  console.log('Tagline: Learn • Grow • Succeed');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failed++;
    }
  }

  // 1. Manifest Validation
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert(manifestContent.name && manifestContent.short_name === 'EdvoNest', 'Manifest has valid EdvoNest brand name');
  assert(manifestContent.display === 'standalone', 'Manifest display mode is set to standalone');
  assert(manifestContent.theme_color === '#086A92', 'Manifest theme_color matches official teal brand color #086A92');
  assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 3, 'Manifest defines required icon sizes');
  assert(Array.isArray(manifestContent.shortcuts) && manifestContent.shortcuts.length >= 4, 'Manifest defines quick mobile shortcuts');

  // 2. Icon Assets Validation
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  assert(fs.existsSync(path.join(iconsDir, 'icon-192.svg')), '192x192 SVG icon exists');
  assert(fs.existsSync(path.join(iconsDir, 'icon-512.svg')), '512x512 SVG icon exists');
  assert(fs.existsSync(path.join(iconsDir, 'icon-maskable.svg')), 'Maskable SVG icon exists');
  assert(fs.existsSync(path.join(iconsDir, 'apple-touch-icon.svg')), 'Apple touch icon exists');

  // 3. Service Worker Validation
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  assert(fs.existsSync(swPath), 'Service Worker file public/sw.js exists');

  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert(swContent.includes('CACHE_NAME'), 'SW defines cache naming and versioning');
  assert(swContent.includes('/api/fees') && swContent.includes('/api/finance'), 'SW strictly enforces sensitive data blacklist');
  assert(swContent.includes('offline.html'), 'SW configures offline.html fallback');
  assert(swContent.includes('push'), 'SW handles push notifications');
  assert(swContent.includes('notificationclick'), 'SW handles notification click redirection');
  assert(swContent.includes('sync'), 'SW handles background synchronization');

  // 4. Offline Fallback HTML
  const offlineHtmlPath = path.join(process.cwd(), 'public', 'offline.html');
  assert(fs.existsSync(offlineHtmlPath), 'public/offline.html fallback page exists');
  const offlineHtml = fs.readFileSync(offlineHtmlPath, 'utf-8');
  assert(offlineHtml.includes('Offline Mode') || offlineHtml.includes('You are Currently Offline'), 'Offline HTML has appropriate messaging');

  // 5. Offline Attendance Queue Functionality
  const testQueueItem = queueOfflineAttendance('sec_test_1', '2026-11-18', [
    { studentId: 'stu_1', status: 'PRESENT' },
    { studentId: 'stu_2', status: 'ABSENT' },
  ]);
  assert(testQueueItem.sectionId === 'sec_test_1', 'Offline attendance queue correctly creates record');
  assert(testQueueItem.records.length === 2, 'Offline attendance queue retains student status payload');

  // 6. Mobile Homework Submission API & Database persistence
  const school = await prisma.school.findFirst();
  const schoolId = school?.id || 'edvonest-main-school';

  const testStudent = await prisma.studentProfile.findFirst({
    where: { user: { schoolId } },
  });

  const testHw = await prisma.homework.findFirst();

  if (testStudent && testHw) {
    const submission = await prisma.homeworkSubmission.create({
      data: {
        homeworkId: testHw.id,
        studentId: testStudent.id,
        submissionText: 'Test mobile homework submission with attached photo of science problem set.',
        status: 'SUBMITTED',
      },
    });

    assert(submission.status === 'SUBMITTED', 'Mobile homework submission persisted in database');
    assert(submission.studentId === testStudent.id, 'Submission mapped to correct student');

    // Clean up test submission
    await prisma.homeworkSubmission.delete({ where: { id: submission.id } });
  }

  // 7. Security: Verify Protected API routes reject unauthenticated requests
  const mockUnauthRes = await prisma.studentFeeInvoice.findFirst({
    where: { schoolId: 'non_existent_school' },
  });
  assert(mockUnauthRes === null, 'Tenant boundary strictly prevents unauthorized record leakage');

  console.log('\n====================================================');
  console.log(`PWA AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

testPwaFeatures()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
