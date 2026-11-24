import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs?: TabItem[];
  items?: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  items,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  const tabList = tabs || items || [];
  if (variant === 'pills') {
    return (
      <div className={twMerge(clsx('flex items-center gap-1.5 p-1 bg-[#F1F5F7] rounded-xl overflow-x-auto', className))}>
        {tabList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap select-none cursor-pointer',
                isActive
                  ? 'bg-white text-[#990000] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717] hover:bg-white/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'px-2 py-0.5 text-xs rounded-full font-bold',
                    isActive ? 'bg-[#FEF2F2] text-[#990000]' : 'bg-[#E5E5E5] text-[#737373]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto', className))}>
      {tabList.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all select-none cursor-pointer -mb-[1px]',
              isActive
                ? 'border-[#990000] text-[#990000] bg-[#FEF2F2]/40'
                : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-[#E5E5E5]'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 text-xs rounded-full font-bold',
                  isActive ? 'bg-[#990000] text-white' : 'bg-[#F1F5F7] text-[#737373]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
