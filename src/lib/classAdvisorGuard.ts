import { prisma } from './db';
import { SessionUser } from './auth';

export interface SectionAccessCheck {
  authorized: boolean;
  role: 'ADMIN' | 'CLASS_ADVISOR' | 'SUBJECT_TEACHER' | 'STUDENT' | 'PARENT' | 'UNAUTHORIZED';
  section?: any;
  reason?: string;
}

/**
 * Resolves the TeacherProfile for a given user ID.
 */
export async function getTeacherProfileByUserId(userId: string) {
  return prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      },
      sections: {
        include: {
          class: true,
          _count: { select: { enrollments: true } },
        },
      },
      teacherAllocations: {
        include: {
          class: true,
          section: true,
          subject: true,
        },
      },
    },
  });
}

/**
 * Retrieves all sections where the teacher is designated as Class Advisor.
 */
export async function getTeacherAdvisorSections(userId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      sections: {
        where: { isActive: true },
        include: {
          class: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  return teacher?.sections || [];
}

/**
 * Retrieves all sections where the teacher is allocated as Subject Teacher or Class Advisor.
 */
export async function getTeacherAuthorizedSections(userId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      sections: {
        where: { isActive: true },
        include: { class: true },
      },
      teacherAllocations: {
        include: {
          class: true,
          section: true,
          subject: true,
        },
      },
    },
  });

  if (!teacher) return { advisorSections: [], subjectSections: [], allSectionIds: [] };

  const advisorSections = teacher.sections;
  const subjectSections = teacher.teacherAllocations.map((a) => a.section).filter(Boolean);

  const sectionMap = new Map<string, any>();
  for (const s of advisorSections) sectionMap.set(s.id, { ...s, isAdvisor: true });
  for (const s of subjectSections) {
    if (!sectionMap.has(s.id)) {
      sectionMap.set(s.id, { ...s, isAdvisor: false });
    }
  }

  const allSections = Array.from(sectionMap.values());
  const allSectionIds = Array.from(sectionMap.keys());

  return {
    teacherProfileId: teacher.id,
    advisorSections,
    subjectSections,
    allSections,
    allSectionIds,
  };
}

/**
 * Centralized RBAC Guard: Verifies if a user has permission to access or modify a section.
 * - School Admins, Super Admins, and Principals have full access to all sections.
 * - Class Advisors have full section management permissions for their assigned section.
 * - Subject Teachers have access for academic/subject duties within their allocated sections.
 * - Unauthorized attempts return authorized: false with 403 reason.
 */
export async function verifySectionAccess(
  user: SessionUser,
  sectionId: string,
  requiredAdvisorOnly = false
): Promise<SectionAccessCheck> {
  if (['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true },
    });
    if (!section) {
      return { authorized: false, role: 'ADMIN', reason: 'Section not found' };
    }
    return { authorized: true, role: 'ADMIN', section };
  }

  if (user.role === 'TEACHER') {
    const teacher = await getTeacherProfileByUserId(user.id);
    if (!teacher) {
      return {
        authorized: false,
        role: 'UNAUTHORIZED',
        reason: 'Teacher profile not found for authenticated user',
      };
    }

    // Check 1: Is this teacher the Class Advisor for this section?
    const isClassAdvisor = teacher.sections.some((s) => s.id === sectionId);
    if (isClassAdvisor) {
      const section = teacher.sections.find((s) => s.id === sectionId);
      return { authorized: true, role: 'CLASS_ADVISOR', section };
    }

    if (requiredAdvisorOnly) {
      return {
        authorized: false,
        role: 'UNAUTHORIZED',
        reason: 'Only the assigned Class Advisor or School Admin is authorized to perform this operation.',
      };
    }

    // Check 2: Is this teacher allocated as a Subject Teacher for this section?
    const isSubjectTeacher = teacher.teacherAllocations.some((a) => a.sectionId === sectionId);
    if (isSubjectTeacher) {
      const allocation = teacher.teacherAllocations.find((a) => a.sectionId === sectionId);
      return { authorized: true, role: 'SUBJECT_TEACHER', section: allocation?.section };
    }

    return {
      authorized: false,
      role: 'UNAUTHORIZED',
      reason: 'Access Denied: You are not assigned as Class Advisor or Subject Teacher for this section.',
    };
  }

  return {
    authorized: false,
    role: 'UNAUTHORIZED',
    reason: 'Insufficient permissions to access class section records',
  };
}
