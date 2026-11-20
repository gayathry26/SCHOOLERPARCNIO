/**
 * EdvoNest Production Structured Logger
 * Emits JSON structured logs with automatic sensitive data redaction.
 * Tagline: Learn • Grow • Succeed
 */

import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'jwt_secret',
  'authorization',
  'cookie',
  'creditcard',
  'cvv',
  'cardnumber',
  'pin',
]);

function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      clean[key] = redactSensitiveData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class Logger {
  private minLevel: LogLevel;
  private logFilePath?: string;

  constructor(level: LogLevel = 'info') {
    this.minLevel = level;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      const logDir = path.join(process.cwd(), 'logs');
      try {
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        this.logFilePath = path.join(logDir, 'production.log');
      } catch {}
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private write(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(context ? { context: redactSensitiveData(context) } : {}),
      env: process.env.NODE_ENV || 'development',
    };

    const formatted = JSON.stringify(logEntry);

    // Standard output
    if (level === 'error' || level === 'fatal') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    // Persist to file in production if configured
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, formatted + '\n');
      } catch {}
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.write('warn', message, context);
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { rawError: error };

    this.write('error', message, { ...context, error: errorDetails });
  }

  fatal(message: string, error?: any, context?: Record<string, any>) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { rawError: error };

    this.write('fatal', message, { ...context, error: errorDetails });
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
);
