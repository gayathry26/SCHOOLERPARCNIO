/**
 * EdvoNest Application Error Tracker
 * Captures, correlates, and tracks runtime exceptions with tenant context.
 * Tagline: Learn • Grow • Succeed
 */

import { logger } from './logger';

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  schoolId?: string;
  route?: string;
  method?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export class ErrorTracker {
  private static instance: ErrorTracker;

  private constructor() {
    this.initProcessHandlers();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private initProcessHandlers() {
    if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason: any) => {
        logger.fatal('Unhandled Promise Rejection Detected', reason);
      });

      process.on('uncaughtException', (error: Error) => {
        logger.fatal('Uncaught Exception Detected', error);
      });
    }
  }

  /**
   * Captures and logs application errors with tenant context
   */
  public capture(error: unknown, context?: ErrorContext) {
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error(`Application Error: ${err.message}`, err, {
      ...context,
      timestamp: new Date().toISOString(),
    });

    // In production, forward to Sentry / Datadog if DSN configured
    if (process.env.SENTRY_DSN) {
      // Sentry.captureException(err, { extra: context });
    }
  }
}

export const errorTracker = ErrorTracker.getInstance();
