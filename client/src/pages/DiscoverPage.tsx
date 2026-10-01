import React, { useState } from 'react';
import { EventItem, RSVP } from '../types/index.ts';
import { EventCalendar } from '../components/EventCalendar.tsx';
import { EventFilterBar } from '../components/EventFilterBar.tsx';
import { EventCard } from '../components/EventCard.tsx';
import { Sparkles, CalendarX, AlertCircle, Compass } from 'lucide-react';

interface DiscoverPageProps {
  events: EventItem[];
  userRsvps: RSVP[];
  isLoading: boolean;
  error: Error | null;
  city: string;
  keyword: string;
  startDate: string;
  endDate: string;
  selectedDate: string | null;
  onCityChange: (city: string) => void;
  onKeywordChange: (keyword: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSelectDate: (date: string | null) => void;
  onResetFilters: () => void;
  onRsvp: (event: EventItem) => Promise<void>;
  onShare: (rsvpId: string, eventId: string) => Promise<string | null>;
  rsvpSubmittingId: string | null;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  events,
  userRsvps,
  isLoading,
  error,
  city,
  keyword,
  startDate,
  endDate,
  selectedDate,
  onCityChange,
  onKeywordChange,
  onStartDateChange,
  onEndDateChange,
  onSelectDate,
  onResetFilters,
  onRsvp,
  onShare,
  rsvpSubmittingId,
}) => {
  // Filter events by selected calendar date if active
  const displayedEvents = selectedDate
    ? events.filter((ev) => ev.date === selectedDate)
    : events;

  // Create lookup for user RSVPs by eventId
  const rsvpMap = userRsvps.reduce((acc, rsvp) => {
    acc[rsvp.eventId] = rsvp;
    return acc;
  }, {} as Record<string, RSVP>);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <section className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-white/10 bg-gradient-to-br from-brand-950/80 via-[#111827] to-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover What's Happening Tonight & Beyond</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Find the Next Move. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-fuchsia-400 to-indigo-300">
              Vibe Check with Your Friends.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Live event feed powered by Ticketmaster with zero-latency RSVP tracking and friend invite tracking.
          </p>
        </div>
      </section>

      {/* Main Grid: Calendar Sidebar & Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <EventCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </div>

        {/* Feed & Filters */}
        <div className="lg:col-span-7 space-y-6">
          <EventFilterBar
            city={city}
            keyword={keyword}
            startDate={startDate}
            endDate={endDate}
            onCityChange={onCityChange}
            onKeywordChange={onKeywordChange}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onReset={onResetFilters}
          />

          {/* Active Date Filter Notice */}
          {selectedDate && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-xs text-brand-200">
              <span>Showing events for selected date: <strong className="text-white">{selectedDate}</strong> ({displayedEvents.length} found)</span>
              <button
                onClick={() => onSelectDate(null)}
                className="underline hover:text-white font-medium ml-2"
              >
                Clear date
              </button>
            </div>
          )}

          {/* Event Cards Section */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3 animate-pulse">
                  <div className="h-44 bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-10 bg-slate-800 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center rounded-2xl glass-panel border border-red-500/20 text-red-300 space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
              <h3 className="font-bold text-white">Error loading events</h3>
              <p className="text-xs text-slate-400">{error.message}</p>
              <button
                onClick={onResetFilters}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Retry
              </button>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-white/5 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                <CalendarX className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No events match your criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting the city, keyword search, or clearing the selected date filter.
                </p>
              </div>
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {displayedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRsvp={rsvpMap[event.id]}
                  onRsvp={onRsvp}
                  onShare={onShare}
                  isRsvpLoading={rsvpSubmittingId === event.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
