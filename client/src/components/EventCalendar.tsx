import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { EventItem } from '../types/index.ts';

interface EventCalendarProps {
  events: EventItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  selectedDate,
  onSelectDate,
}) => {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => {
    // If events have dates, initialize near the first event date or current date
    if (events.length > 0 && events[0].date) {
      const parts = events[0].date.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Map events to date string "YYYY-MM-DD"
  const eventCountsByDate = events.reduce((acc, ev) => {
    if (ev.date) {
      acc[ev.date] = (acc[ev.date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateString: '',
      hasEvent: false,
      eventCount: 0,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    const count = eventCountsByDate[dateString] || 0;

    calendarDays.push({
      day,
      isCurrentMonth: true,
      dateString,
      hasEvent: count > 0,
      eventCount: count,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remainingCells = 35 - calendarDays.length;
  const paddingNeeded = remainingCells > 0 ? remainingCells : (42 - calendarDays.length);
  for (let day = 1; day <= paddingNeeded; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateString: '',
      hasEvent: false,
      eventCount: 0,
    });
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">Filter events by date</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <span>{selectedDate}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item, idx) => {
          const isSelected = item.dateString === selectedDate;

          if (!item.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-10 sm:h-12 flex items-center justify-center text-xs text-slate-600 rounded-lg select-none"
              >
                {item.day}
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (isSelected) {
                  onSelectDate(null);
                } else {
                  onSelectDate(item.dateString);
                }
              }}
              className={`group relative h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-600 text-white font-bold ring-2 ring-brand-400 shadow-lg shadow-brand-500/30'
                  : item.hasEvent
                  ? 'bg-brand-950/60 hover:bg-brand-900/60 border border-brand-500/30 text-white font-medium'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <span className="text-xs sm:text-sm">{item.day}</span>

              {/* Event highlight dot & count badge */}
              {item.hasEvent && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-fuchsia-400 shadow-sm shadow-fuchsia-500'
                    }`}
                  />
                  {item.eventCount > 1 && (
                    <span
                      className={`text-[9px] font-bold px-1 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-fuchsia-500/20 text-fuchsia-300'
                      }`}
                    >
                      {item.eventCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
            <span>Dates with events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-brand-600" />
            <span>Selected date</span>
          </div>
        </div>
        {selectedDate && (
          <span className="text-brand-300 font-medium">Filtering by {selectedDate}</span>
        )}
      </div>
    </div>
  );
};
