'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { Button } from './Button';
import { exportToCSV } from '@/lib/export';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  searchKey?: string | ((row: T) => string);
  exportFilename?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable,
  pagination,
  pageSize: initialPageSize = 10,
  searchPlaceholder = 'Search records...',
  searchKey,
  exportFilename = 'records',
  selectable = false,
  onSelectionChange,
  actions,
  filters,
  emptyMessage = 'No records found matching your criteria.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (typeof searchKey === 'function') {
        return searchKey(row).toLowerCase().includes(term);
      }
      if (typeof searchKey === 'string') {
        return String(row[searchKey] || '').toLowerCase().includes(term);
      }
      // Search all fields in row
      return Object.values(row).some((val) =>
        String(val || '').toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(paginatedData.map((r, i) => r.id || i));
      setSelectedIds(newSelected);
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T, id: any) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    const selectedRows = data.filter((r, i) => newSelected.has(r.id || i));
    onSelectionChange?.(selectedRows);
  };

  const handleExport = () => {
    const cleanData = sortedData.map((row) => {
      const copy: Record<string, any> = {};
      columns.forEach((col) => {
        copy[col.header] = row[col.key];
      });
      return copy;
    });
    exportToCSV(cleanData, `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bg-white border border-[#E4EAEC] rounded-xl shadow-2xs overflow-hidden">
      {/* Header controls */}
      <div className="p-3.5 border-b border-[#E4EAEC] flex flex-col md:flex-row gap-3 items-center justify-between bg-[#F7FAFA]">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C83]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E4EAEC] rounded-lg text-[#17313A] placeholder:text-[#6B7C83] focus:outline-none focus:ring-2 focus:ring-[#086A92]/15 focus:border-[#086A92] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {filters}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-3.5 h-3.5 text-[#6B7C83]" />}
          >
            Export CSV
          </Button>
          {actions}
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#17313A]">
          <thead className="bg-[#F7FAFA] text-xs font-bold text-[#4A5D65] border-b border-[#E4EAEC] tracking-wider uppercase">
            <tr>
              {selectable && (
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedIds.size >= paginatedData.length}
                    className="rounded border-[#E4EAEC] text-[#086A92] focus:ring-[#086A92] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-[#EAF5F8]/50 select-none' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown className="w-4 h-4 text-[#6B7C83]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4EAEC]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-[#6B7C83]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id || idx;
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-[#F7FAFA] transition-colors ${
                      isSelected ? 'bg-[#EAF5F8]/40' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row, rowId)}
                          className="rounded border-[#E4EAEC] text-[#086A92] focus:ring-[#086A92] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5 text-[#17313A]">
                        {col.render ? col.render(row) : (row[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-[#E4EAEC] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#4A5D65] bg-[#F7FAFA]">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-[#E4EAEC] rounded-md px-2.5 py-1 text-sm text-[#17313A] focus:outline-none focus:ring-1 focus:ring-[#086A92]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-2 font-semibold text-[#17313A] text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
