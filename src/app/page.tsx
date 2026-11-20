import React from 'react';
import { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'EdvoNest — Modern School Management Operating System',
  description:
    'Edvonest Model International Academy ERP. Unified attendance, automated fee ledgers, CBSE examinations, live bus GPS tracking, parent transparency, and student learning.',
};

export default function HomePage() {
  return <LandingPage />;
}
