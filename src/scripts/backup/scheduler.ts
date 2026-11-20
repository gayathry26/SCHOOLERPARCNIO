/**
 * EdvoNest Recurring Backup Scheduler
 * Runs periodic automated snapshots (daily / weekly) with retention enforcement.
 * Tagline: Learn • Grow • Succeed
 */

import { backupManager } from '../../lib/backup/backup-manager';
import { logger } from '../../lib/monitoring/logger';

const BACKUP_INTERVAL_HOURS = parseInt(process.env.BACKUP_INTERVAL_HOURS || '24', 10);
const INTERVAL_MS = BACKUP_INTERVAL_HOURS * 60 * 60 * 1000;

console.log(`[BACKUP_SCHEDULER] Starting automated backup service. Interval: ${BACKUP_INTERVAL_HOURS} hour(s).`);

async function triggerScheduledBackup() {
  try {
    logger.info('[BACKUP_SCHEDULER] Triggering scheduled database backup...');
    const result = await backupManager.createEncryptedBackup({ category: 'daily' });
    logger.info(`[BACKUP_SCHEDULER] Backup completed: ${result.metadata.backupId}`);
  } catch (error: any) {
    logger.error('[BACKUP_SCHEDULER] Scheduled backup failed', error);
  }
}

// Initial execution
triggerScheduledBackup();

// Recurring timer
const timer = setInterval(triggerScheduledBackup, INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(timer);
  console.log('[BACKUP_SCHEDULER] Service stopped gracefully.');
  process.exit(0);
});
