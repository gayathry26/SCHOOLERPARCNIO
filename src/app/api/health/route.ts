import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { perfMonitor } from '@/lib/monitoring/metrics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  const uptimeSeconds = Math.round(process.uptime());

  // Memory Metrics
  const mem = process.memoryUsage();
  const memoryStats = {
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    rssMb: Math.round(mem.rss / 1024 / 1024),
    externalMb: Math.round(mem.external / 1024 / 1024),
  };

  let dbStatus = 'UP';
  let dbLatencyMs = 0;
  let dbError = null;

  try {
    const dbStart = performance.now();
    // Test database connection by pinging count or basic query
    await prisma.school.count();
    dbLatencyMs = Math.round(performance.now() - dbStart);
  } catch (err: any) {
    dbStatus = 'DOWN';
    dbError = err.message;
  }

  const isHealthy = dbStatus === 'UP';
  const statusCode = isHealthy ? 200 : 503;
  const totalDurationMs = Math.round(performance.now() - startTime);

  perfMonitor.recordRequest('/api/health', 'GET', statusCode, totalDurationMs);

  return NextResponse.json(
    {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0-cbse.prod',
      subsystems: {
        database: {
          status: dbStatus,
          engine: 'MySQL',
          server: 'localhost:3306',
          database: 'schoolerpedvonest',
          latencyMs: dbLatencyMs,
          ...(dbError ? { error: dbError } : {}),
        },
        memory: memoryStats,
        storage: { status: 'UP', driver: process.env.STORAGE_DRIVER || 'local' },
      },
      metrics: perfMonitor.getStats(),
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
