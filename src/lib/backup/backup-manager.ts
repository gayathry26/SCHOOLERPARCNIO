/**
 * EdvoNest Production Database Backup & Disaster Recovery Manager
 * Automated snapshots, AES-256-GCM encryption, checksum validation, retention & restore.
 * Tagline: Learn • Grow • Succeed
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { execSync } from 'child_process';
import { logger } from '../monitoring/logger';

export interface BackupMetadata {
  backupId: string;
  timestamp: string;
  sourceDatabase: string;
  databaseType: 'sqlite' | 'postgres' | 'mysql';
  originalSizeBytes: number;
  compressedSizeBytes: number;
  encryptedSizeBytes: number;
  sha256Checksum: string;
  algorithm: 'aes-256-gcm';
  saltHex: string;
  ivHex: string;
  authTagHex: string;
  retentionCategory: 'daily' | 'weekly' | 'monthly';
}

export class BackupManager {
  private backupDir: string;
  private encryptionKey: string;

  constructor(
    backupDir = './backups',
    encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'edvonest_prod_aes256_backup_master_key_32b!'
  ) {
    this.backupDir = path.resolve(process.cwd(), backupDir);
    this.encryptionKey = encryptionKey;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o700 });
      }
    } catch (e) {
      logger.error('Failed to create backup directory', e);
    }
  }

  private deriveKey(salt: Buffer): Buffer {
    // PBKDF2 with 100,000 iterations to derive a cryptographically sound 32-byte key
    return crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, 32, 'sha256');
  }

  /**
   * Creates an encrypted, compressed snapshot of the database
   */
  public async createEncryptedBackup(options: {
    sourcePath?: string;
    category?: 'daily' | 'weekly' | 'monthly';
  } = {}): Promise<{ backupFile: string; metaFile: string; metadata: BackupMetadata }> {
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `edvonest_backup_${timestampStr}`;
    const encFileName = `${backupId}.enc`;
    const metaFileName = `${backupId}.meta.json`;

    const encFilePath = path.join(this.backupDir, encFileName);
    const metaFilePath = path.join(this.backupDir, metaFileName);

    logger.info(`Starting automated encrypted backup: ${backupId}`);

    let rawData: Buffer;
    let sourceDatabaseName = 'schoolerpedvonest';
    let dbType: 'sqlite' | 'postgres' | 'mysql' = 'mysql';

    const dbUrl = process.env.DATABASE_URL || '';
    if (options.sourcePath) {
      const sourceDbPath = path.resolve(process.cwd(), options.sourcePath);
      if (!fs.existsSync(sourceDbPath)) {
        throw new Error(`Source database file not found at: ${sourceDbPath}`);
      }
      rawData = await fs.promises.readFile(sourceDbPath);
      sourceDatabaseName = path.basename(sourceDbPath);
      dbType = 'sqlite';
    } else if (dbUrl.startsWith('mysql:')) {
      dbType = 'mysql';
      sourceDatabaseName = 'schoolerpedvonest';
      const mysqldumpBin = fs.existsSync('C:\\xampp\\mysql\\bin\\mysqldump.exe')
        ? 'C:\\xampp\\mysql\\bin\\mysqldump.exe'
        : 'mysqldump';
      try {
        rawData = execSync(`"${mysqldumpBin}" -u root schoolerpedvonest --default-character-set=utf8mb4`);
      } catch (err: any) {
        throw new Error(`Failed to generate MySQL dump for backup: ${err.message}`);
      }
    } else {
      const sourceDbPath = path.resolve(process.cwd(), './prisma/dev.db');
      if (!fs.existsSync(sourceDbPath)) {
        throw new Error(`Source database file not found at: ${sourceDbPath}`);
      }
      rawData = await fs.promises.readFile(sourceDbPath);
      sourceDatabaseName = path.basename(sourceDbPath);
      dbType = 'sqlite';
    }

    const originalSizeBytes = rawData.length;

    // 2. Compute SHA-256 of raw data for integrity verification
    const sha256Checksum = crypto.createHash('sha256').update(rawData).digest('hex');

    // 3. Compress with Gzip
    const compressedData = zlib.gzipSync(rawData, { level: 9 });
    const compressedSizeBytes = compressedData.length;

    // 4. Derive AES-256 key with cryptographic salt
    const salt = crypto.randomBytes(16);
    const derivedKey = this.deriveKey(salt);
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM

    // 5. Encrypt with AES-256-GCM (Authenticated Encryption)
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    const encryptedData = Buffer.concat([cipher.update(compressedData), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedSizeBytes = encryptedData.length;

    // 6. Write Encrypted Payload to disk
    await fs.promises.writeFile(encFilePath, encryptedData, { mode: 0o600 });

    // 7. Write Metadata Catalog
    const metadata: BackupMetadata = {
      backupId,
      timestamp: new Date().toISOString(),
      sourceDatabase: sourceDatabaseName,
      databaseType: dbType,
      originalSizeBytes,
      compressedSizeBytes,
      encryptedSizeBytes,
      sha256Checksum,
      algorithm: 'aes-256-gcm',
      saltHex: salt.toString('hex'),
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      retentionCategory: options.category || 'daily',
    };

    await fs.promises.writeFile(metaFilePath, JSON.stringify(metadata, null, 2), { mode: 0o600 });

    logger.info(
      `Backup completed successfully: ${encFileName} (Raw: ${(originalSizeBytes / 1024).toFixed(1)} KB -> Encrypted: ${(encryptedSizeBytes / 1024).toFixed(1)} KB)`
    );

    // Enforce retention policy
    await this.enforceRetentionPolicy();

    return { backupFile: encFilePath, metaFile: metaFilePath, metadata };
  }

  /**
   * Restores and verifies a database from an encrypted backup archive
   */
  public async restoreFromEncryptedBackup(
    backupFileOrId: string,
    targetRestorePath?: string
  ): Promise<{ success: boolean; targetPath: string; verifiedChecksum: string }> {
    let encFilePath = backupFileOrId;
    if (!encFilePath.endsWith('.enc')) {
      encFilePath = path.join(this.backupDir, `${backupFileOrId}.enc`);
    }

    const metaFilePath = encFilePath.replace(/\.enc$/, '.meta.json');

    if (!fs.existsSync(encFilePath) || !fs.existsSync(metaFilePath)) {
      throw new Error(`Backup files missing: neither ${encFilePath} nor ${metaFilePath} could be loaded.`);
    }

    logger.info(`Initiating database restoration from backup: ${path.basename(encFilePath)}`);

    // 1. Read Metadata
    const metaRaw = await fs.promises.readFile(metaFilePath, 'utf-8');
    const metadata: BackupMetadata = JSON.parse(metaRaw);

    // 2. Read Encrypted Ciphertext
    const encryptedData = await fs.promises.readFile(encFilePath);

    // 3. Re-derive AES-256 Key
    const salt = Buffer.from(metadata.saltHex, 'hex');
    const iv = Buffer.from(metadata.ivHex, 'hex');
    const authTag = Buffer.from(metadata.authTagHex, 'hex');
    const derivedKey = this.deriveKey(salt);

    // 4. Decrypt with Authentication Verification
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decryptedCompressed: Buffer;
    try {
      decryptedCompressed = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } catch (err: any) {
      throw new Error(`AUTHENTICATED DECRYPTION FAILED: Backup archive appears corrupted or tampered! (${err.message})`);
    }

    // 5. Decompress Gzip
    const restoredRaw = zlib.gunzipSync(decryptedCompressed);

    // 6. Verify SHA-256 Checksum against metadata
    const restoredChecksum = crypto.createHash('sha256').update(restoredRaw).digest('hex');
    if (restoredChecksum !== metadata.sha256Checksum) {
      throw new Error(
        `CHECKSUM MISMATCH: Expected ${metadata.sha256Checksum} but got ${restoredChecksum}. Restoration aborted.`
      );
    }

    if (metadata.databaseType === 'mysql') {
      const mysqlBin = fs.existsSync('C:\\xampp\\mysql\\bin\\mysql.exe')
        ? 'C:\\xampp\\mysql\\bin\\mysql.exe'
        : 'mysql';
      try {
        execSync(`"${mysqlBin}" -u root schoolerpedvonest`, { input: restoredRaw });
        logger.info(`MySQL database successfully restored and verified into schoolerpedvonest`);
        return { success: true, targetPath: 'MySQL:schoolerpedvonest', verifiedChecksum: restoredChecksum };
      } catch (err: any) {
        throw new Error(`Failed to restore MySQL database dump: ${err.message}`);
      }
    }

    // 7. Write to target database location safely
    const targetPath = path.resolve(process.cwd(), targetRestorePath || './prisma/dev.db');

    // If target exists, create a safety rollback snapshot first
    if (fs.existsSync(targetPath)) {
      const rollbackPath = `${targetPath}.pre_restore_rollback_${Date.now()}.bak`;
      await fs.promises.copyFile(targetPath, rollbackPath);
      logger.info(`Safety pre-restore rollback snapshot created at: ${rollbackPath}`);
    }

    await fs.promises.writeFile(targetPath, restoredRaw);

    logger.info(`Database successfully restored and verified at: ${targetPath}`);
    return { success: true, targetPath, verifiedChecksum: restoredChecksum };
  }

  /**
   * Enforces backup retention policy (deletes expired daily/weekly archives)
   */
  public async enforceRetentionPolicy(maxDaily = 7, maxWeekly = 4, maxMonthly = 12): Promise<{ purged: number }> {
    const files = await fs.promises.readdir(this.backupDir);
    const metaFiles = files.filter((f) => f.endsWith('.meta.json'));

    const backups: BackupMetadata[] = [];
    for (const mf of metaFiles) {
      try {
        const raw = await fs.promises.readFile(path.join(this.backupDir, mf), 'utf-8');
        backups.push(JSON.parse(raw));
      } catch {}
    }

    // Sort descending by timestamp
    backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    let purgedCount = 0;
    // Keep most recent maxDaily backups, purge older ones if exceeded
    if (backups.length > maxDaily + maxWeekly + maxMonthly) {
      const expired = backups.slice(maxDaily + maxWeekly + maxMonthly);
      for (const exp of expired) {
        const encPath = path.join(this.backupDir, `${exp.backupId}.enc`);
        const metaPath = path.join(this.backupDir, `${exp.backupId}.meta.json`);
        try {
          if (fs.existsSync(encPath)) await fs.promises.unlink(encPath);
          if (fs.existsSync(metaPath)) await fs.promises.unlink(metaPath);
          purgedCount++;
          logger.info(`Purged expired backup: ${exp.backupId}`);
        } catch {}
      }
    }

    return { purged: purgedCount };
  }

  /**
   * Lists available backup archives with status
   */
  public async listBackups(): Promise<BackupMetadata[]> {
    const files = await fs.promises.readdir(this.backupDir);
    const metaFiles = files.filter((f) => f.endsWith('.meta.json'));

    const list: BackupMetadata[] = [];
    for (const mf of metaFiles) {
      try {
        const raw = await fs.promises.readFile(path.join(this.backupDir, mf), 'utf-8');
        list.push(JSON.parse(raw));
      } catch {}
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const backupManager = new BackupManager();
