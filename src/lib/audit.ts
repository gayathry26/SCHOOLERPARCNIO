import { prisma } from './db';

export async function logAudit({
  schoolId,
  userId,
  action,
  module,
  recordId,
  previousValue,
  newValue,
  ipAddress,
}: {
  schoolId?: string | null;
  userId?: string | null;
  action: string;
  module: string;
  recordId?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        schoolId: schoolId || undefined,
        userId: userId || undefined,
        action,
        module,
        recordId: recordId || undefined,
        previousValue: previousValue || undefined,
        newValue: newValue || undefined,
        ipAddress: ipAddress || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
