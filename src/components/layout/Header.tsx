'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, Menu, Wifi, WifiOff, BellRing, Download, Zap, Compass } from 'lucide-react';
import { OmniSearch } from './OmniSearch';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationCenter } from './NotificationCenter';
import { SessionUser } from '@/lib/auth';
import { EdvoNestLogo } from '@/components/ui/EdvoNestLogo';
import { isOnline } from '@/lib/offline-sync';
import { triggerQuickAction } from './QuickActionLauncher';

interface HeaderProps {
  user: SessionUser;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenDrawer }) => {
  const router = useRouter();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E4EAEC] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left items: Mobile Hamburger Drawer Button + Academic Session + Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="md:hidden p-1.5 rounded-lg text-slate-700 hover:text-[#086A92] hover:bg-[#EAF5F8] transition-colors cursor-pointer"
          title="Open Menu Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand icon when sidebar is hidden */}
        <div className="md:hidden flex items-center">
          <EdvoNestLogo variant="icon-only" size="sm" />
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F7FAFA] border border-[#E4EAEC] rounded-xl text-xs font-semibold text-[#17313A] shadow-2xs">
          <Calendar className="w-4 h-4 text-[#086A92]" />
          <span className="text-[#6B7C83]">Session:</span>
          <span className="font-bold text-[#086A92]">2026–2027 (CBSE)</span>
          <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-pulse" />
        </div>

        <OmniSearch userRole={user.role} />

        <button
          onClick={() => triggerQuickAction('LAUNCHER')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF5F8] hover:bg-[#086A92] text-[#086A92] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border border-[#c0e3ed]"
          title="Open Quick Action Launcher"
        >
          <Zap className="w-3.5 h-3.5 text-[#35B84A]" />
          <span>Quick Actions</span>
        </button>
      </div>

      {/* Right items: Online/Offline Pill, Role Switcher, Notifications, User Badge, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Role Walkthrough Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('start-walkthrough'))}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#086A92] hover:bg-[#EAF5F8] rounded-lg transition-colors border border-slate-200 hover:border-[#c0e3ed] cursor-pointer shadow-2xs"
          title="Restart guided tour for your role"
        >
          <Compass className="w-3.5 h-3.5 text-[#086A92]" />
          <span>Tour</span>
        </button>

        {/* Real-time Network Indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}
          title={online ? 'Connected to EdvoNest Cloud' : 'Working in Offline Mode'}
        >
          {online ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>

        <RoleSwitcher currentRole={user.role} currentUserName={`${user.firstName} ${user.lastName}`} />

        <div className="h-5 w-[1px] bg-[#E4EAEC] hidden sm:block" />

        <NotificationCenter />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#086A92] text-white flex items-center justify-center text-xs font-black shadow-xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#17313A] leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-[#6B7C83] font-medium leading-tight mt-0.5">{user.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 text-[#6B7C83] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
