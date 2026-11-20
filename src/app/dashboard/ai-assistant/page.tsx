import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AiAssistantClient } from './AiAssistantClient';

export default async function AiAssistantPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <AiAssistantClient
      userRole={user.role}
      userName={`${user.firstName} ${user.lastName}`}
    />
  );
}
