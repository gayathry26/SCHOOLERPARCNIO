import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'edvonest-production-super-secret-key-2026';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'TEACHER'
  | 'CLASS_TEACHER'
  | 'ACCOUNTANT'
  | 'HR_MANAGER'
  | 'LIBRARIAN'
  | 'TRANSPORT_MANAGER'
  | 'TRANSPORT_STAFF'
  | 'COUNSELLOR'
  | 'NURSE'
  | 'STUDENT'
  | 'PARENT'
  | 'RECEPTIONIST';

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  name?: string;
  schoolId?: string | null;
  studentProfileId?: string;
  teacherProfileId?: string;
  parentProfileId?: string;
  staffProfileId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('edvonest_session')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) return null;

    // Fetch up-to-date user details with profile IDs
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        studentProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
        parentProfile: { select: { id: true } },
        staffProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      schoolId: user.schoolId,
      studentProfileId: user.studentProfile?.id,
      teacherProfileId: user.teacherProfile?.id,
      parentProfileId: user.parentProfile?.id,
      staffProfileId: user.staffProfile?.id,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  SCHOOL_ADMIN: [
    'manage_students',
    'manage_admissions',
    'manage_academics',
    'manage_attendance',
    'manage_timetable',
    'manage_exams',
    'manage_fees',
    'manage_finance',
    'manage_hr',
    'manage_homework',
    'manage_communication',
    'manage_transport',
    'manage_library',
    'manage_certificates',
    'manage_id_cards',
    'manage_cms',
    'view_reports',
    'manage_settings',
    'view_audit_logs',
    'access_ai',
  ],
  PRINCIPAL: [
    'view_students',
    'view_academics',
    'view_attendance',
    'view_timetable',
    'manage_exams',
    'lock_exams',
    'view_fees',
    'view_finance',
    'view_hr',
    'view_communication',
    'view_reports',
    'access_ai',
    'view_audit_logs',
  ],
  TEACHER: [
    'view_assigned_classes',
    'mark_attendance',
    'view_timetable',
    'manage_homework',
    'enter_marks',
    'view_study_materials',
    'teacher_chat',
    'apply_leave',
    'access_ai',
  ],
  ACCOUNTANT: [
    'manage_fees',
    'collect_fees',
    'generate_invoices',
    'manage_finance',
    'view_finance_reports',
    'access_ai',
  ],
  HR_MANAGER: [
    'manage_hr',
    'manage_staff_attendance',
    'manage_leaves',
    'process_payroll',
    'view_staff_reports',
    'access_ai',
  ],
  STUDENT: [
    'view_my_timetable',
    'view_my_attendance',
    'view_my_homework',
    'submit_homework',
    'view_my_exams',
    'view_my_marks',
    'view_my_fees',
    'view_my_library',
    'view_my_transport',
    'view_announcements',
    'access_ai_tutor',
  ],
  PARENT: [
    'view_children',
    'view_child_attendance',
    'view_child_homework',
    'view_child_exams',
    'view_child_report_card',
    'pay_child_fees',
    'view_child_transport',
    'message_teacher',
    'view_announcements',
  ],
  TRANSPORT_STAFF: ['view_routes', 'view_assigned_students', 'view_bus_schedule'],
  LIBRARIAN: ['manage_library_books', 'issue_return_books', 'manage_library_fines'],
  VICE_PRINCIPAL: [
    'view_students',
    'view_academics',
    'view_attendance',
    'view_timetable',
    'manage_exams',
    'view_reports',
    'access_ai',
  ],
  CLASS_TEACHER: [
    'view_assigned_classes',
    'mark_attendance',
    'view_timetable',
    'manage_homework',
    'enter_marks',
    'access_ai',
  ],
  TRANSPORT_MANAGER: [
    'manage_transport',
    'view_routes',
    'manage_vehicles',
    'track_gps',
  ],
  COUNSELLOR: ['view_students', 'student_wellness', 'parent_consultation'],
  NURSE: ['student_health', 'clinic_records', 'manage_first_aid'],
  RECEPTIONIST: ['visitor_passes', 'gate_entry', 'admission_inquiries'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
