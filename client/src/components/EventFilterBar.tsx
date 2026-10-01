import React from 'react';
import { Search, MapPin, CalendarDays, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  city: string;
  keyword: string;
  startDate: string;
  endDate: string;
  onCityChange: (city: string) => void;
  onKeywordChange: (keyword: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

const POPULAR_CITIES = ['All Cities', 'New York', 'San Francisco', 'Chicago', 'London', 'Austin'];

export const EventFilterBar: React.FC<FilterBarProps> = ({
  city,
  keyword,
  startDate,
  endDate,
  onCityChange,
  onKeywordChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(city || keyword || startDate || endDate);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-lg space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Keyword Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search artists, venue, vibe..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            aria-label="Filter events by city"
            value={city}
            onChange={(e) => onCityChange(e.target.value === 'All Cities' ? '' : e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#111827] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all appearance-none cursor-pointer"
          >
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c === 'All Cities' ? '' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <input
            type="date"
            aria-label="Start date filter"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
          />
        </div>

        {/* End Date */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <input
              type="date"
              aria-label="End date filter"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              title="Reset all filters"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
