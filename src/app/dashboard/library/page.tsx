import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { LibraryClient } from './LibraryClient';

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'LIBRARY')) redirect('/dashboard');

  const [booksData, issuesData, studentsData] = await Promise.all([
    prisma.libraryBook.findMany({ orderBy: { title: 'asc' } }),
    prisma.bookIssueRecord.findMany({
      include: {
        book: true,
        student: { include: { user: true } },
      },
      orderBy: { issueDate: 'desc' },
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      include: { user: true },
      orderBy: { admissionNumber: 'asc' },
    }),
  ]);

  return <LibraryClient books={booksData} issues={issuesData} students={studentsData} userRole={user.role} />;
}
