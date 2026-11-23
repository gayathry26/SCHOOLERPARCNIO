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
                  ? 'bg-white text-[#086A92] shadow-2xs'
                  : 'text-[#6B7C83] hover:text-[#17313A] hover:bg-white/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'px-2 py-0.5 text-xs rounded-full font-bold',
                    isActive ? 'bg-[#EAF5F8] text-[#086A92]' : 'bg-[#E4EAEC] text-[#6B7C83]'
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
    <div className={twMerge(clsx('flex items-center gap-2 border-b border-[#E4EAEC] overflow-x-auto', className))}>
      {tabList.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all select-none cursor-pointer -mb-[1px]',
              isActive
                ? 'border-[#086A92] text-[#086A92] bg-[#EAF5F8]/40'
                : 'border-transparent text-[#6B7C83] hover:text-[#17313A] hover:border-[#cbd7da]'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 text-xs rounded-full font-bold',
                  isActive ? 'bg-[#086A92] text-white' : 'bg-[#F1F5F7] text-[#6B7C83]'
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
