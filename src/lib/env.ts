/**
 * EdvoNest Environment Variable Validator
 * Validates critical environment variables at application startup.
 * Tagline: Learn • Grow • Succeed
 */

export interface ValidatedEnv {
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  BACKUP_ENCRYPTION_KEY: string;
  BACKUP_STORAGE_PATH: string;
  BACKUP_RETENTION_DAYS: number;
  STORAGE_DRIVER: 'local' | 's3' | 'gcs';
  STORAGE_LOCAL_DIR: string;
  STORAGE_MAX_FILE_SIZE_MB: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_PERFORMANCE_METRICS: boolean;
  APP_URL: string;
}

export function validateEnv(env: Record<string, string | undefined> = process.env): ValidatedEnv {
  const errors: string[] = [];

  const NODE_ENV = (env.NODE_ENV || 'development') as 'development' | 'staging' | 'production' | 'test';
  if (!['development', 'staging', 'production', 'test'].includes(NODE_ENV)) {
    errors.push(`Invalid NODE_ENV: "${NODE_ENV}". Must be one of: development, staging, production, test.`);
  }

  const DATABASE_URL = env.DATABASE_URL || '';
  if (!DATABASE_URL) {
    errors.push('Missing required DATABASE_URL environment variable.');
  }

  // Security checks for production & staging
  const isProdOrStaging = NODE_ENV === 'production' || NODE_ENV === 'staging';

  if (isProdOrStaging && DATABASE_URL.startsWith('file:')) {
    errors.push(
      'CRITICAL: SQLite ("file:...") cannot be used in production or staging. Configure PostgreSQL or MySQL for multi-tenant concurrency.'
    );
  }

  const JWT_SECRET = env.JWT_SECRET || '';
  if (!JWT_SECRET) {
    errors.push('Missing required JWT_SECRET environment variable.');
  } else if (isProdOrStaging && JWT_SECRET.length < 32) {
    errors.push(`JWT_SECRET must be at least 32 characters in ${NODE_ENV} (current length: ${JWT_SECRET.length}).`);
  }

  const BACKUP_ENCRYPTION_KEY = env.BACKUP_ENCRYPTION_KEY || 'edvonest_dev_backup_aes256_key_32bytes!';
  if (isProdOrStaging && (!BACKUP_ENCRYPTION_KEY || BACKUP_ENCRYPTION_KEY.length < 32)) {
    errors.push(
      `BACKUP_ENCRYPTION_KEY must be at least 32 characters in ${NODE_ENV} for AES-256-GCM encryption.`
    );
  }

  const BACKUP_RETENTION_DAYS = parseInt(env.BACKUP_RETENTION_DAYS || '30', 10);
  if (isNaN(BACKUP_RETENTION_DAYS) || BACKUP_RETENTION_DAYS < 1) {
    errors.push('BACKUP_RETENTION_DAYS must be a positive integer.');
  }

  const STORAGE_MAX_FILE_SIZE_MB = parseInt(env.STORAGE_MAX_FILE_SIZE_MB || '10', 10);
  if (isNaN(STORAGE_MAX_FILE_SIZE_MB) || STORAGE_MAX_FILE_SIZE_MB < 1) {
    errors.push('STORAGE_MAX_FILE_SIZE_MB must be a positive integer.');
  }

  if (errors.length > 0) {
    const errorMsg = `[ENV_VALIDATION_ERROR] Environment configuration validation failed:\n- ${errors.join('\n- ')}`;
    if (NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn(errorMsg);
    }
  }

  return {
    NODE_ENV,
    DATABASE_URL,
    JWT_SECRET,
    BACKUP_ENCRYPTION_KEY,
    BACKUP_STORAGE_PATH: env.BACKUP_STORAGE_PATH || './backups',
    BACKUP_RETENTION_DAYS,
    STORAGE_DRIVER: (env.STORAGE_DRIVER || 'local') as 'local' | 's3' | 'gcs',
    STORAGE_LOCAL_DIR: env.STORAGE_LOCAL_DIR || './storage/secure_uploads',
    STORAGE_MAX_FILE_SIZE_MB,
    LOG_LEVEL: (env.LOG_LEVEL || (isProdOrStaging ? 'info' : 'debug')) as 'debug' | 'info' | 'warn' | 'error',
    ENABLE_PERFORMANCE_METRICS: env.ENABLE_PERFORMANCE_METRICS === 'true',
    APP_URL: env.APP_URL || 'http://localhost:3000',
  };
}

// Global cached validated environment object
export const envConfig = validateEnv();
