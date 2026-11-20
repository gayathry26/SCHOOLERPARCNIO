/**
 * EdvoNest API Performance & Query Metrics Monitor
 * Tracks latencies, status codes, and flags slow queries.
 * Tagline: Learn • Grow • Succeed
 */

import { logger } from './logger';

export interface RequestMetric {
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: RequestMetric[] = [];
  private readonly maxStoredMetrics = 1000;
  private readonly slowThresholdMs = 300; // 300ms SLA threshold

  /**
   * Records execution of an API request
   */
  public recordRequest(route: string, method: string, statusCode: number, durationMs: number) {
    const metric: RequestMetric = {
      route,
      method,
      statusCode,
      durationMs: Math.round(durationMs),
      timestamp: Date.now(),
    };

    if (this.metrics.length >= this.maxStoredMetrics) {
      this.metrics.shift();
    }
    this.metrics.push(metric);

    if (durationMs > this.slowThresholdMs) {
      logger.warn(`Slow API Endpoint Detected: [${method}] ${route} took ${Math.round(durationMs)}ms (threshold: ${this.slowThresholdMs}ms)`);
    }
  }

  /**
   * Tracks a database query or async operation duration
   */
  public async trackQuery<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      if (duration > this.slowThresholdMs) {
        logger.warn(`Slow Database Query Detected: "${name}" took ${Math.round(duration)}ms`);
      }
    }
  }

  /**
   * Returns aggregated statistics
   */
  public getStats() {
    const totalRequests = this.metrics.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        avgDurationMs: 0,
        p95DurationMs: 0,
        errorRatePercent: 0,
        slowRequestsCount: 0,
      };
    }

    const durations = this.metrics.map((m) => m.durationMs).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / totalRequests);
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const errors = this.metrics.filter((m) => m.statusCode >= 500).length;
    const slow = this.metrics.filter((m) => m.durationMs > this.slowThresholdMs).length;

    return {
      totalRequests,
      avgDurationMs: avg,
      p95DurationMs: p95,
      errorRatePercent: Math.round((errors / totalRequests) * 100),
      slowRequestsCount: slow,
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
