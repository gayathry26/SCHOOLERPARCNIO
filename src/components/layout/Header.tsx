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
    <header className="h-16 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left items: Mobile Hamburger Drawer Button + Academic Session + Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="md:hidden p-2 rounded-lg text-[#171717] hover:text-[#990000] hover:bg-red-50 transition-colors cursor-pointer"
          title="Open Menu Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand icon when sidebar is hidden */}
        <div className="md:hidden flex items-center">
          <EdvoNestLogo variant="icon-only" size="sm" />
        </div>

        {/* Session Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717]">
          <Calendar className="w-3.5 h-3.5 text-[#990000]" />
          <span className="text-[#525252]">Session:</span>
          <span className="font-bold text-[#990000]">2026–2027 (CBSE)</span>
          <span className="w-2 h-2 rounded-full bg-[#990000] animate-pulse" />
        </div>

        <OmniSearch userRole={user.role} />

        <button
          onClick={() => triggerQuickAction('LAUNCHER')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-[#990000] text-[#990000] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-red-200"
          title="Open Quick Action Launcher"
        >
          <Zap className="w-3.5 h-3.5 text-[#990000]" />
          <span>Quick Actions</span>
        </button>
      </div>

      {/* Right items: Online/Offline Pill, Role Switcher, Notifications, User Badge, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Walkthrough Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('start-walkthrough'))}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#525252] hover:text-[#990000] hover:bg-red-50 rounded-lg transition-colors border border-[#E5E5E5] hover:border-red-200 cursor-pointer"
          title="Restart guided tour for your role"
        >
          <Compass className="w-3.5 h-3.5 text-[#990000]" />
          <span>Tour</span>
        </button>

        {/* Real-time Network Indicator */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${online ? 'bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5]' : 'bg-red-50 text-[#990000] border border-red-200'
            }`}
          title={online ? 'Connected to Institutional Cloud OS' : 'Offline mode active (Local Queue)'}
        >
          {online ? <Wifi className="w-3 h-3 text-[#990000]" /> : <WifiOff className="w-3 h-3 text-[#990000]" />}
          <span className="hidden sm:inline">{online ? 'Cloud Synced' : 'Offline Mode'}</span>
        </div>

        {/* Role Switcher */}
        <RoleSwitcher currentRole={user.role} />

        {/* Notification Center */}
        <NotificationCenter userRole={user.role} />

        {/* User Mini Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
          <div className="w-8 h-8 rounded-full bg-[#990000] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div className="hidden sm:block text-left text-xs leading-tight">
            <div className="font-bold text-[#171717] truncate max-w-[110px]">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-[10px] font-semibold text-[#990000] capitalize">
              {user.role.toLowerCase().replace('_', ' ')}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#525252] hover:text-[#990000] hover:bg-red-50 transition-colors ml-1 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
