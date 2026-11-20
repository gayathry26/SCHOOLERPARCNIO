import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Validates connection to the persistent XAMPP MySQL database (schoolerpedvonest).
 * Returns status and human-readable diagnostic instructions if MySQL service is stopped.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  engine: string;
  database: string;
  server: string;
  error?: string;
}> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      engine: 'MySQL',
      database: 'schoolerpedvonest',
      server: 'localhost:3306',
    };
  } catch (err: any) {
    const errorMsg = `[CRITICAL DATABASE ERROR]: Unable to connect to MySQL database "schoolerpedvonest" on localhost:3306. Please start MySQL from the XAMPP Control Panel. Error details: ${err.message}`;
    console.error(errorMsg);
    return {
      connected: false,
      engine: 'MySQL',
      database: 'schoolerpedvonest',
      server: 'localhost:3306',
      error: errorMsg,
    };
  }
}
