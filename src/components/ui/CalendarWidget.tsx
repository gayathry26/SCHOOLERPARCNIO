'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface CalendarWidgetEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string;
  venue?: string;
  category?: 'HOLIDAY' | 'EXAM' | 'HOMEWORK' | 'EVENT' | 'PTM';
  color?: string;
}

export interface CalendarWidgetProps {
  events?: CalendarWidgetEvent[];
  initialDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events = [],
  initialDate = new Date(),
  onSelectDate,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Month grid calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map events to date strings (YYYY-MM-DD)
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarWidgetEvent[]> = {};
    events.forEach((ev) => {
      const dStr = new Date(ev.date).toISOString().split('T')[0];
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(ev);
    });
    return map;
  }, [events]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedEvents = eventMap[selectedDateStr] || [];

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      {/* Month Header Nav */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#086A92]" />
          <span>{monthName}</span>
        </h4>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="text-rose-500">Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(year, month, dayNum);
          const dateStr = dayDate.toISOString().split('T')[0];
          const hasEvents = Boolean(eventMap[dateStr]);
          const isToday =
            dayDate.toDateString() === new Date().toDateString();
          const isSelected =
            dayDate.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={dayNum}
              onClick={() => {
                setSelectedDate(dayDate);
                onSelectDate?.(dayDate);
              }}
              className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center relative font-semibold transition ${
                isSelected
                  ? 'bg-[#086A92] text-white shadow-2xs font-bold'
                  : isToday
                  ? 'bg-sky-50 text-[#086A92] ring-1 ring-[#086A92]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[11px] leading-none">{dayNum}</span>
              {hasEvents && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    isSelected ? 'bg-white' : 'bg-emerald-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Events summary below selected day */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Events for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

        {selectedEvents.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic py-1">No scheduled items</p>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-slate-900 block truncate text-[11px]">
                    {ev.title}
                  </span>
                  {ev.time && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {ev.time}
                    </span>
                  )}
                </div>
                <Badge variant={ev.category === 'EXAM' ? 'purple' : ev.category === 'HOLIDAY' ? 'rose' : 'emerald'} size="xs">
                  {ev.category || 'Event'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
