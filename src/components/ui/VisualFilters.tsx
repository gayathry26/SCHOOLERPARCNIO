'use client';

import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface VisualFiltersProps {
  // Search
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Chips
  chips?: FilterChip[];
  selectedChipId?: string;
  onSelectChip?: (id: string) => void;

  // Dropdown
  dropdownLabel?: string;
  dropdownOptions?: DropdownOption[];
  selectedDropdownValue?: string;
  onSelectDropdown?: (val: string) => void;

  // Reset
  onReset?: () => void;
  isFilterActive?: boolean;

  className?: string;
}

export const VisualFilters: React.FC<VisualFiltersProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  chips = [],
  selectedChipId,
  onSelectChip,
  dropdownOptions = [],
  selectedDropdownValue,
  onSelectDropdown,
  onReset,
  isFilterActive = false,
  className = '',
}) => {
  return (
    <div className={`p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 ${className}`}>
      {/* Row 1: Search & Optional Dropdown Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onSearchChange && (
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#990000] outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {dropdownOptions.length > 0 && onSelectDropdown && (
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={selectedDropdownValue}
              onChange={(e) => onSelectDropdown(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#990000] outline-none text-slate-700 transition"
            >
              {dropdownOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isFilterActive && onReset && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition flex items-center gap-1.5 shrink-0"
            title="Clear all active filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Row 2: Filter Chips */}
      {chips.length > 0 && onSelectChip && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {chips.map((chip) => {
            const isSelected = selectedChipId === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onSelectChip(chip.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition flex items-center gap-1.5 border text-xs ${
                  isSelected
                    ? 'bg-[#990000] text-white border-[#990000] shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {chip.color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: chip.color }}
                  />
                )}
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
