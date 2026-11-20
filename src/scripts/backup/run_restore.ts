import { backupManager } from '../../lib/backup/backup-manager';

async function main() {
  console.log('=== EDVONEST DATABASE RESTORE UTILITY ===');
  console.log('Tagline: Learn • Grow • Succeed\n');

  const args = process.argv.slice(2);
  let backupFileOrId = args[0];

  if (!backupFileOrId) {
    const available = await backupManager.listBackups();
    if (available.length === 0) {
      console.error('No backup archives found in ./backups/');
      process.exit(1);
    }
    backupFileOrId = available[0].backupId;
    console.log(`No specific backup provided. Defaulting to latest backup: ${backupFileOrId}`);
  }

  const targetPath = args[1] || './prisma/dev.db';

  try {
    const res = await backupManager.restoreFromEncryptedBackup(backupFileOrId, targetPath);
    console.log('Database restored and verified successfully:');
    console.log(`- Target: ${res.targetPath}`);
    console.log(`- Verified SHA-256 Checksum: ${res.verifiedChecksum}`);
  } catch (err: any) {
    console.error('Restoration failed:', err.message);
    process.exit(1);
  }
}

main();
