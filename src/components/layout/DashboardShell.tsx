'use client';

import React, { useState, useEffect } from 'react';
import { SessionUser } from '@/lib/auth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDrawerNav } from './MobileDrawerNav';
import { QuickActionLauncher } from './QuickActionLauncher';
import { UserWalkthrough } from '@/components/onboarding/UserWalkthrough';
import { ToastContainer } from '@/components/ui/Toast';

interface DashboardShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ user, children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvonest_sidebar_collapsed');
      if (saved) setIsSidebarCollapsed(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('edvonest_sidebar_collapsed', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] flex flex-col md:flex-row">
      {/* Desktop Fixed Left Navigation Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentRole={user.role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </div>

      {/* Mobile Slide-out Drawer */}
      <MobileDrawerNav
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 ml-0 transition-all duration-300 flex flex-col min-h-screen ${
          isSidebarCollapsed ? 'md:ml-18' : 'md:ml-64'
        }`}
      >
        <Header user={user} onOpenDrawer={() => setIsDrawerOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-4 pb-24 md:pb-8">
          <Breadcrumbs userRole={user.role} />
          {children}
        </main>
      </div>

      {/* Global Quick Action Launcher Modal Engine */}
      <QuickActionLauncher currentRole={user.role} />

      {/* Role-Specific Lightweight Walkthrough Companion */}
      <UserWalkthrough userRole={user.role} />

      {/* Global Notification Toast Container */}
      <ToastContainer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentRole={user.role}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
    </div>
  );
};
