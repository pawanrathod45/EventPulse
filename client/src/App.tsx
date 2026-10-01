import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, EventQueryParams } from './services/api.ts';
import { EventItem } from './types/index.ts';
import { UserProvider, useUser } from './context/UserContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DiscoverPage } from './pages/DiscoverPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { InviteLandingPage } from './pages/InviteLandingPage.tsx';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

function MainApp() {
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Route / Page state
  const [inviteToken, setInviteToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      const token = path.replace('/invite/', '').split('/')[0];
      return token || null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('invite') || null;
  });

  const [currentTab, setCurrentTab] = useState<'discover' | 'dashboard'>('discover');

  // Filter state
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Submitting tracker
  const [rsvpSubmittingId, setRsvpSubmittingId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'info' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Query events
  const eventQueryParams: EventQueryParams = {
    city: city || undefined,
    keyword: keyword || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const {
    data: events = [],
    isLoading: isEventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ['events', eventQueryParams],
    queryFn: () => api.getEvents(eventQueryParams),
  });

  // Query user RSVPs
  const {
    data: userRsvps = [],
    isLoading: isRsvpsLoading,
  } = useQuery({
    queryKey: ['user-rsvps', currentUser?._id],
    queryFn: () => (currentUser?._id ? api.getUserRSVPs(currentUser._id) : Promise.resolve([])),
    enabled: Boolean(currentUser?._id),
  });

  // RSVP Mutation
  const rsvpMutation = useMutation({
    mutationFn: (event: EventItem) => {
      if (!currentUser?._id) throw new Error('No user selected');
      setRsvpSubmittingId(event.id);
      return api.createRSVP({
        userId: currentUser._id,
        eventId: event.id,
        eventSnapshot: event,
        status: 'interested',
      });
    },
    onSuccess: (_, event) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      addToast('success', `RSVP confirmed for "${event.title}"!`);
      setRsvpSubmittingId(null);
    },
    onError: (err: any) => {
      addToast('error', err?.message || 'Failed to submit RSVP');
      setRsvpSubmittingId(null);
    },
  });

  // Cancel RSVP Mutation
  const cancelRsvpMutation = useMutation({
    mutationFn: (rsvpId: string) => api.cancelRSVP(rsvpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      addToast('info', 'RSVP cancelled.');
    },
    onError: (err: any) => {
      addToast('error', err?.message || 'Failed to cancel RSVP');
    },
  });

  // Handle Share link generation
  const handleShare = async (rsvpId: string, eventId: string): Promise<string | null> => {
    if (!currentUser?._id) {
      addToast('error', 'Please select an active user profile first');
      return null;
    }
    try {
      const res = await api.generateShareLink({ rsvpId, userId: currentUser._id });
      if (res?.shareUrl) {
        await navigator.clipboard.writeText(res.shareUrl);
        addToast('success', 'Invite link copied to clipboard! Share it with friends to test the Vibe Check.');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        return res.shareUrl;
      }
      return null;
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to generate share link');
      return null;
    }
  };

  const handleResetFilters = () => {
    setCity('');
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        rsvpCount={userRsvps.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {inviteToken ? (
          <InviteLandingPage
            token={inviteToken}
            onExplore={() => {
              setInviteToken(null);
              window.history.pushState({}, '', '/');
              setCurrentTab('discover');
            }}
            onRsvpSuccess={(ev) => {
              queryClient.invalidateQueries({ queryKey: ['user-rsvps'] });
              queryClient.invalidateQueries({ queryKey: ['events'] });
              addToast('success', `RSVP confirmed for "${ev.title}"!`);
            }}
          />
        ) : currentTab === 'discover' ? (
          <DiscoverPage
            events={events}
            userRsvps={userRsvps}
            isLoading={isEventsLoading}
            error={eventsError as Error | null}
            city={city}
            keyword={keyword}
            startDate={startDate}
            endDate={endDate}
            selectedDate={selectedDate}
            onCityChange={setCity}
            onKeywordChange={setKeyword}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSelectDate={setSelectedDate}
            onResetFilters={handleResetFilters}
            onRsvp={async (ev) => {
              await rsvpMutation.mutateAsync(ev);
            }}
            onShare={handleShare}
            rsvpSubmittingId={rsvpSubmittingId}
          />
        ) : (
          <DashboardPage
            rsvps={userRsvps}
            isLoading={isRsvpsLoading}
            onCancelRsvp={async (id) => {
              await cancelRsvpMutation.mutateAsync(id);
            }}
            onShare={handleShare}
            onExploreEvents={() => setCurrentTab('discover')}
          />
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-slide-up transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : 'bg-slate-900/90 border-white/20 text-white shadow-black/50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm font-medium flex-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
