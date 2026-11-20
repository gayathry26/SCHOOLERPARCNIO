'use client';

import React, { useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, FileText, DollarSign, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { Illustration } from '@/components/ui/Illustration';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

export const NotificationCenter: React.FC<{ initialNotifications?: NotificationItem[] }> = ({
  initialNotifications = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FEE':
        return <DollarSign className="w-3.5 h-3.5 text-[#086A92]" />;
      case 'ATTENDANCE':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />;
      case 'EXAM':
        return <Calendar className="w-3.5 h-3.5 text-[#D97706]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#35B84A]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6B7C83] hover:text-[#086A92] hover:bg-[#EAF5F8] rounded-lg transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E4EAEC] p-0 z-50 animate-in fade-in-50 zoom-in-95 overflow-hidden">
          <div className="p-3.5 border-b border-[#E4EAEC] flex items-center justify-between bg-[#F7FAFA]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17313A] uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#086A92] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E4EAEC]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Illustration variant="no-notifications" size={88} />
                <p className="text-xs font-bold text-[#17313A] mt-2">All Caught Up</p>
                <p className="text-[11px] text-[#6B7C83] mt-0.5">No unread alerts or notifications right now.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-[#F7FAFA] transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-[#EAF5F8]/30' : ''
                    }`}
                >
                  <div className="p-2 bg-[#F1F5F7] rounded-lg shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#17313A] leading-tight">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[#6B7C83] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#6B7C83] mt-1.5">
                      <Clock className="w-3 h-3 text-[#008C91]" />
                      <span>{formatDate(n.createdAt, 'dd MMM, hh:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
