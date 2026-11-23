'use client';

import React from 'react';
import { Camera, Mail, Phone, MapPin, QrCode as QrIcon } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface ProfileHeaderMetaTag {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  colorClass?: string;
}

export interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string | null;
  statusBadge?: {
    label: string;
    variant?: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose';
  };
  idCode?: string;
  idLabel?: string;
  subtitle?: React.ReactNode;
  metaTags?: ProfileHeaderMetaTag[];
  house?: string;
  qrDataUrl?: string;
  onQrClick?: () => void;
  onPhotoEdit?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatarUrl,
  statusBadge = { label: 'Active', variant: 'emerald' },
  idCode,
  idLabel = 'ID',
  subtitle,
  metaTags = [],
  house,
  qrDataUrl,
  onQrClick,
  onPhotoEdit,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E4EAEC] rounded-2xl p-5 sm:p-6 shadow-2xs ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left col: Avatar & Bio */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group shrink-0">
            <Avatar
              src={avatarUrl}
              name={name}
              size="xl"
              house={house}
              shape="rounded"
            />
            {onPhotoEdit && (
              <button
                type="button"
                onClick={onPhotoEdit}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#086A92] text-white rounded-full shadow-md hover:bg-[#065A7D] transition-transform hover:scale-110 cursor-pointer border-2 border-white"
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {name}
              </h1>
              {statusBadge && (
                <Badge variant={statusBadge.variant || 'emerald'} size="xs">
                  {statusBadge.label}
                </Badge>
              )}
              {idCode && (
                <span className="text-xs font-mono font-bold text-[#086A92] bg-[#EAF5F8] px-2.5 py-0.5 rounded-lg border border-[#c0e3ed]">
                  {idLabel}: {idCode}
                </span>
              )}
            </div>

            {subtitle && (
              <div className="text-sm text-slate-600 font-medium">
                {subtitle}
              </div>
            )}

            {metaTags.length > 0 && (
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 pt-0.5 flex-wrap">
                {metaTags.map((tag, i) => {
                  const TagIcon = tag.icon;
                  return (
                    <span key={i} className="flex items-center gap-1.5">
                      <TagIcon className={`w-4 h-4 ${tag.colorClass || 'text-slate-400'}`} />
                      <span>{tag.text}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right col: QR Verification & Actions */}
        <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex-wrap sm:flex-nowrap">
          {qrDataUrl && (
            <div className="flex items-center gap-2.5">
              <div className="text-left lg:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Gate Verification
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Encrypted QR</p>
              </div>
              <img
                src={qrDataUrl}
                alt="Verification QR"
                onClick={onQrClick}
                className="w-14 h-14 rounded-xl border border-slate-200 p-1 bg-white shadow-2xs cursor-pointer hover:border-[#086A92] transition"
              />
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
