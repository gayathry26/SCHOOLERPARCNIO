import { backupManager } from '../../lib/backup/backup-manager';

async function main() {
  console.log('=== EDVONEST DATABASE BACKUP UTILITY ===');
  console.log('Tagline: Learn • Grow • Succeed\n');

  try {
    const result = await backupManager.createEncryptedBackup({
      category: 'daily',
    });

    console.log('Backup generated successfully:');
    console.log(`- Archive: ${result.backupFile}`);
    console.log(`- Metadata: ${result.metaFile}`);
    console.log(`- Original Size: ${(result.metadata.originalSizeBytes / 1024).toFixed(2)} KB`);
    console.log(`- Encrypted Size: ${(result.metadata.encryptedSizeBytes / 1024).toFixed(2)} KB`);
    console.log(`- SHA-256 Checksum: ${result.metadata.sha256Checksum}`);
    console.log(`- Algorithm: ${result.metadata.algorithm.toUpperCase()}`);
    console.log('\nBackup process completed cleanly.');
  } catch (error: any) {
    console.error('Fatal backup error:', error.message);
    process.exit(1);
  }
}

main();
