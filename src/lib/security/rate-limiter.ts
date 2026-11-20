/**
 * EdvoNest Production Rate Limiter
 * In-memory sliding-window counter with Redis abstraction support.
 * Tagline: Learn • Grow • Succeed
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMIT_PROFILES: Record<string, RateLimitRule> = {
  // Strict auth limits to prevent brute-force attacks
  auth: { windowMs: 60 * 1000, maxRequests: 5 },
  // Financial payments to prevent race conditions or rapid double-submissions
  payment: { windowMs: 60 * 1000, maxRequests: 10 },
  // Standard API endpoints
  standard: { windowMs: 60 * 1000, maxRequests: 120 },
};

interface ClientHistory {
  timestamps: number[];
}

const clientRequestStore = new Map<string, ClientHistory>();

// Periodic cleanup of stale client buckets (runs every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, history] of clientRequestStore.entries()) {
      const recent = history.timestamps.filter((t) => now - t < 5 * 60 * 1000);
      if (recent.length === 0) {
        clientRequestStore.delete(key);
      } else {
        clientRequestStore.set(key, { timestamps: recent });
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP safely from proxy headers (x-forwarded-for, cf-connecting-ip, etc.)
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Checks whether the incoming request conforms to the specified rate limit profile.
 */
export function checkRateLimit(
  req: NextRequest,
  profile: 'auth' | 'payment' | 'standard' = 'standard'
): { allowed: boolean; remaining: number; resetMs: number } {
  const ip = getClientIp(req);
  const rule = RATE_LIMIT_PROFILES[profile] || RATE_LIMIT_PROFILES.standard;
  const key = `${profile}:${ip}`;
  const now = Date.now();

  const history = clientRequestStore.get(key) || { timestamps: [] };
  // Keep only requests within the active window
  const validTimestamps = history.timestamps.filter((t) => now - t < rule.windowMs);

  if (validTimestamps.length >= rule.maxRequests) {
    const oldest = validTimestamps[0];
    const resetMs = Math.max(0, rule.windowMs - (now - oldest));
    return { allowed: false, remaining: 0, resetMs };
  }

  validTimestamps.push(now);
  clientRequestStore.set(key, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: rule.maxRequests - validTimestamps.length,
    resetMs: rule.windowMs,
  };
}

/**
 * Guard utility for Route Handlers: returns 429 response if limit exceeded.
 */
export function enforceRateLimit(
  req: NextRequest,
  profile: 'auth' | 'payment' | 'standard' = 'standard'
): NextResponse | null {
  const { allowed, remaining, resetMs } = checkRateLimit(req, profile);
  if (!allowed) {
    const retrySeconds = Math.ceil(resetMs / 1000);
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry in ${retrySeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retrySeconds),
          'X-RateLimit-Limit': String(RATE_LIMIT_PROFILES[profile].maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + resetMs) / 1000)),
        },
      }
    );
  }
  return null;
}
