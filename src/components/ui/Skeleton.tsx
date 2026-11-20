'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-3'
      : 'rounded-xl';

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-[#E4EAEC]/70 ${shapeClass} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-5 bg-white border border-[#E4EAEC] rounded-2xl space-y-3 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton variant="rect" className="w-32 h-7" />
      <Skeleton variant="text" className="w-40" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E4EAEC] rounded-2xl overflow-hidden shadow-2xs ${className}`}>
      {/* Table Header */}
      <div className="p-4 border-b border-[#E4EAEC] bg-[#F7FAFA] flex items-center justify-between gap-4">
        <Skeleton variant="text" className="w-48 h-8 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton variant="rect" className="w-24 h-8" />
          <Skeleton variant="rect" className="w-24 h-8" />
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[#E4EAEC]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div key={cIdx} className="flex-1">
                <Skeleton variant="text" className={cIdx === 0 ? 'w-3/4' : 'w-1/2'} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number; className?: string }> = ({
  height = 260,
  className = '',
}) => {
  return (
    <div className={`p-5 bg-white border border-[#E4EAEC] rounded-2xl space-y-4 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-36 h-4" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
        <Skeleton variant="rect" className="w-20 h-7" />
      </div>
      <div
        style={{ height }}
        className="flex items-end justify-between gap-3 pt-6 border-b border-[#E4EAEC]"
      >
        {Array.from({ length: 7 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rect"
            className="flex-1 rounded-t-lg"
            height={`${Math.max(20, ((idx * 37) % 75) + 25)}%`}
          />
        ))}
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white border border-[#E4EAEC] rounded-2xl flex items-center gap-4 shadow-2xs ${className}`}>
      <Skeleton variant="circle" className="w-16 h-16 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-48 h-5" />
        <Skeleton variant="text" className="w-32 h-3" />
        <Skeleton variant="text" className="w-64 h-3" />
      </div>
    </div>
  );
};
