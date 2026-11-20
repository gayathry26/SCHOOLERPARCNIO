import { SessionUser } from './auth';
import { prisma } from './db';
import { AppModule } from './permissions';

export interface TenantContext {
  schoolId: string;
  isSuperAdmin: boolean;
  schoolName: string;
  subscriptionPlan: string;
  isSubscriptionActive: boolean;
}

/**
 * Validates and retrieves the tenant context for a request.
 */
export async function getTenantContext(user: SessionUser | null, overrideSchoolId?: string | null): Promise<TenantContext | null> {
  if (!user) return null;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const effectiveSchoolId = isSuperAdmin && overrideSchoolId ? overrideSchoolId : user.schoolId;

  if (!effectiveSchoolId) return null;

  const school = await prisma.school.findUnique({
    where: { id: effectiveSchoolId },
    select: {
      id: true,
      name: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      status: true,
    },
  });

  if (!school) return null;

  return {
    schoolId: school.id,
    isSuperAdmin,
    schoolName: school.name,
    subscriptionPlan: school.subscriptionPlan,
    isSubscriptionActive: school.status === 'ACTIVE' && ['ACTIVE', 'TRIAL'].includes(school.subscriptionStatus),
  };
}

/**
 * Enforces cross-tenant boundary security.
 * Rejects any request attempting to access or modify resources of another school.
 */
export function enforceTenantIsolation(user: SessionUser | null, targetSchoolId: string | null | undefined): boolean {
  if (!user) return false;
  // Super admin has platform-wide oversight privileges
  if (user.role === 'SUPER_ADMIN') return true;

  if (!targetSchoolId || !user.schoolId) return false;
  return user.schoolId === targetSchoolId;
}

/**
 * Validates whether an institution has reached its subscription student capacity.
 */
export async function checkStudentCapacity(schoolId: string): Promise<{
  canEnroll: boolean;
  currentStudents: number;
  maxStudents: number;
}> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { maxStudents: true },
  });

  const max = school?.maxStudents || 1000;

  const currentCount = await prisma.user.count({
    where: { schoolId, role: 'STUDENT' },
  });

  return {
    canEnroll: currentCount < max,
    currentStudents: currentCount,
    maxStudents: max,
  };
}

/**
 * Verifies whether a given ERP module is permitted under the school's active subscription tier.
 */
export function isModuleEnabledForSchool(school: { enabledModules?: string | null; subscriptionPlan?: string }, module: AppModule): boolean {
  if (!school.enabledModules || school.enabledModules === 'ALL') return true;

  try {
    const modules: string[] = school.enabledModules.startsWith('[')
      ? JSON.parse(school.enabledModules)
      : school.enabledModules.split(',').map((m) => m.trim());
    return modules.includes(module);
  } catch {
    return true;
  }
}
