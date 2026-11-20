/**
 * EdvoNest Secure File Storage Service
 * Whitelist validation, path sanitization, size limits, and isolation.
 * Tagline: Learn • Grow • Succeed
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../monitoring/logger';

export interface StoredFile {
  originalName: string;
  sanitizedName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  sha256Checksum: string;
  uploadedAt: Date;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx']);

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.sh', '.bash', '.php', '.phtml', '.js', '.mjs', '.ts', '.html', '.htm',
  '.bat', '.cmd', '.vbs', '.py', '.rb', '.jar', '.dll', '.so', '.app',
]);

export class SecureStorageService {
  private baseDir: string;
  private maxSizeBytes: number;

  constructor(baseDir = './storage/secure_uploads', maxMb = 10) {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.maxSizeBytes = maxMb * 1024 * 1024;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o750 });
      }
    } catch (e) {
      logger.error('Failed to initialize secure upload directory', e);
    }
  }

  /**
   * Validates file safety constraints (size, extension, MIME type)
   */
  public validateFile(originalName: string, mimeType: string, sizeBytes: number): { valid: boolean; error?: string } {
    if (sizeBytes > this.maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds maximum permitted limit of ${this.maxSizeBytes / (1024 * 1024)}MB.`,
      };
    }

    const ext = path.extname(originalName).toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return { valid: false, error: `Dangerous executable file extension "${ext}" is strictly forbidden.` };
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return { valid: false, error: `File extension "${ext}" is not permitted. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}.` };
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return { valid: false, error: `MIME type "${mimeType}" is not permitted.` };
    }

    // Path traversal check
    if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
      return { valid: false, error: 'Illegal path traversal sequence in filename.' };
    }

    return { valid: true };
  }

  /**
   * Saves a buffer securely with a collision-resistant UUID filename
   */
  public async storeBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    schoolId = 'edvonest-main'
  ): Promise<StoredFile> {
    const validation = this.validateFile(originalName, mimeType, buffer.length);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // Partition by tenant schoolId for storage isolation
    const tenantDir = path.join(this.baseDir, schoolId.replace(/[^a-zA-Z0-9_-]/g, ''));
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true, mode: 0o750 });
    }

    const ext = path.extname(originalName).toLowerCase();
    const sanitizedName = `${crypto.randomUUID()}${ext}`;
    const targetFilePath = path.join(tenantDir, sanitizedName);

    // Compute SHA-256 Checksum
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    await fs.promises.writeFile(targetFilePath, buffer);

    const stored: StoredFile = {
      originalName,
      sanitizedName,
      storagePath: targetFilePath,
      mimeType,
      sizeBytes: buffer.length,
      sha256Checksum: hash,
      uploadedAt: new Date(),
    };

    logger.info(`Securely stored file "${originalName}" as "${sanitizedName}" (${buffer.length} bytes)`, {
      schoolId,
      checksum: hash,
    });

    return stored;
  }

  /**
   * Safely reads a stored file
   */
  public async readStoredFile(storagePath: string): Promise<Buffer> {
    // Prevent reading outside baseDir
    const resolved = path.resolve(storagePath);
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error('Access Denied: Attempted path traversal out of secure storage root.');
    }
    return fs.promises.readFile(resolved);
  }
}

export const secureStorage = new SecureStorageService();
