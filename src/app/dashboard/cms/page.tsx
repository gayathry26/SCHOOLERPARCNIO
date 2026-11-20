import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { CmsClient } from './CmsClient';

export default async function CmsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessModule(user.role, 'SETTINGS')) redirect('/dashboard');

  const [pagesData, schoolData] = await Promise.all([
    prisma.cmsPage.findMany(),
    prisma.school.findFirst(),
  ]);

  return <CmsClient pages={pagesData} school={schoolData} />;
}
