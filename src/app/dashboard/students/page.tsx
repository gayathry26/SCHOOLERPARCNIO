import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getTeacherAuthorizedSections } from '@/lib/classAdvisorGuard';
import { StudentsClient } from './StudentsClient';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'STUDENTS')) redirect('/dashboard');

  const [
    studentsData,
    classesData,
    academicYears,
    totalStudentsCount,
    activeStudentsCount,
    newAdmissionsCount,
    withdrawalsCount,
    transfersCount,
  ] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: {
          where: { academicYear: { isCurrent: true } },
          include: { class: true, section: true, academicYear: true },
          take: 1,
        },
        parents: { include: { parent: { include: { user: true } } } },
        documents: { select: { id: true, status: true } },
        transferCertificates: { select: { id: true, tcNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      include: {
        sections: {
          where: { isActive: true },
          include: {
            _count: {
              select: { enrollments: { where: { status: 'ACTIVE' } } },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    }),
    prisma.studentProfile.count(),
    prisma.studentProfile.count({
      where: {
        isArchived: false,
        lifecycleStage: { in: ['ACTIVE_ENROLLMENT', 'ENQUIRY', 'APPLICATION', 'ADMISSION'] },
      },
    }),
    prisma.studentProfile.count({
      where: {
        admissionDate: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    }),
    prisma.studentProfile.count({
      where: {
        OR: [
          { isArchived: true },
          { lifecycleStage: { in: ['WITHDRAWN', 'TC_ISSUED'] } },
        ],
      },
    }),
    prisma.sectionTransferLog.count(),
  ]);

  // Role-based boundary enforcement
  let scopedStudents = studentsData;
  if (user.role === 'TEACHER') {
    const auth = await getTeacherAuthorizedSections(user.id);
    scopedStudents = studentsData.filter((s) => {
      const secId = s.enrollments[0]?.sectionId;
      return secId && auth.allSectionIds.includes(secId);
    });
  } else if (user.role === 'PARENT') {
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      include: { students: true },
    });
    const childIds = parentProfile?.students.map((c) => c.studentId) || [];
    scopedStudents = studentsData.filter((s) => childIds.includes(s.id));
  } else if (user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });
    scopedStudents = studentsData.filter((s) => s.id === studentProfile?.id);
  }

  const initialStudents = scopedStudents.map((s) => ({
    id: s.id,
    admissionNumber: s.admissionNumber,
    rollNumber: s.rollNumber || s.enrollments[0]?.rollNumber || '-',
    name: `${s.user.firstName} ${s.user.lastName}`,
    email: s.user.email,
    gender: s.gender,
    dob: s.dob.toISOString().split('T')[0],
    bloodGroup: s.bloodGroup || '-',
    className: s.enrollments[0]?.class?.name || 'Unassigned',
    sectionName: s.enrollments[0]?.section?.name || '-',
    classId: s.enrollments[0]?.classId,
    sectionId: s.enrollments[0]?.sectionId,
    academicYearName: s.enrollments[0]?.academicYear?.name || '2026-2027',
    parentName:
      s.fatherName ||
      (s.parents[0]?.parent?.user
        ? `${s.parents[0].parent.user.firstName} ${s.parents[0].parent.user.lastName}`
        : 'Guardian On File'),
    parentPhone: s.fatherPhone || s.parents[0]?.parent?.phone || s.emergencyContact || '-',
    fatherName: s.fatherName || '',
    fatherPhone: s.fatherPhone || '',
    motherName: s.motherName || '',
    motherPhone: s.motherPhone || '',
    guardianName: s.guardianName || '',
    guardianPhone: s.guardianPhone || '',
    house: s.house || 'General',
    lifecycleStage: s.lifecycleStage,
    isArchived: s.isArchived,
    tcNumber: s.tcNumber || s.transferCertificates[0]?.tcNumber || null,
    documentsCount: s.documents.length,
    admissionDate: s.admissionDate.toISOString().split('T')[0],
  }));

  const classes = classesData.map((c) => ({
    id: c.id,
    name: c.name,
    sections: c.sections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      enrolledCount: sec._count.enrollments,
    })),
  }));

  // Analytics payload computed directly from database
  const maleCount = scopedStudents.filter((s) => s.gender === 'MALE').length;
  const femaleCount = scopedStudents.filter((s) => s.gender === 'FEMALE').length;
  const totalInScope = scopedStudents.length;

  const analytics = {
    totalStudents: totalStudentsCount,
    activeStudents: activeStudentsCount,
    newAdmissions: newAdmissionsCount,
    withdrawals: withdrawalsCount,
    transfers: transfersCount,
    genderRatio: {
      male: maleCount,
      female: femaleCount,
      malePercent: totalInScope > 0 ? Math.round((maleCount / totalInScope) * 100) : 50,
      femalePercent: totalInScope > 0 ? Math.round((femaleCount / totalInScope) * 100) : 50,
    },
    classDistribution: classesData.map((c) => ({
      name: c.name,
      total: c.sections.reduce((acc, sec) => acc + sec._count.enrollments, 0),
    })),
  };

  return (
    <StudentsClient
      initialStudents={initialStudents}
      classes={classes}
      academicYears={academicYears.map((ay) => ({
        id: ay.id,
        name: ay.name,
        isCurrent: ay.isCurrent,
      }))}
      analytics={analytics}
      userRole={user.role}
    />
  );
}
