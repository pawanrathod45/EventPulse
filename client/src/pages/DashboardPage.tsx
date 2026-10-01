import React, { useState, useEffect } from 'react';
import { RSVP } from '../types/index.ts';
import { BookmarkCheck, Calendar, Clock, MapPin, Trash2, Share2, Check, ArrowRight, Loader2, Users, Bell, BellRing } from 'lucide-react';
import { useUser } from '../context/UserContext.tsx';
import { api } from '../services/api.ts';

interface DashboardPageProps {
  rsvps: RSVP[];
  isLoading: boolean;
  onCancelRsvp: (rsvpId: string) => Promise<void>;
  onShare: (rsvpId: string, eventId: string) => Promise<string | null>;
  onExploreEvents: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  rsvps,
  isLoading,
  onCancelRsvp,
  onShare,
  onExploreEvents,
}) => {
  const { currentUser, setCurrentUser } = useUser();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  // Reminder settings state
  const [emailNotify, setEmailNotify] = useState<boolean>(true);
  const [hoursBefore, setHoursBefore] = useState<number>(24);
  const [isSavingReminders, setIsSavingReminders] = useState(false);
  const [remindersSaved, setRemindersSaved] = useState(false);

  useEffect(() => {
    if (currentUser?.reminderSettings) {
      setEmailNotify(currentUser.reminderSettings.emailNotify);
      setHoursBefore(currentUser.reminderSettings.reminderHoursBefore || 24);
    }
  }, [currentUser]);

  const handleSaveReminders = async () => {
    if (!currentUser?._id) return;
    try {
      setIsSavingReminders(true);
      const updated = await api.updateUserReminders(currentUser._id, {
        emailNotify,
        reminderHoursBefore: Number(hoursBefore),
      });
      setCurrentUser(updated);
      setRemindersSaved(true);
      setTimeout(() => setRemindersSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update reminders');
    } finally {
      setIsSavingReminders(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this RSVP?')) return;
    try {
      setCancellingId(id);
      await onCancelRsvp(id);
    } finally {
      setCancellingId(null);
    }
  };

  const handleShareClick = async (rsvp: RSVP) => {
    try {
      setSharingId(rsvp._id);
      const url = await onShare(rsvp._id, rsvp.eventId);
      if (url) {
        setCopiedId(rsvp._id);
        setTimeout(() => setCopiedId(null), 3000);
      }
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-brand-950/60 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Attendance Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Your RSVP Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Managing confirmed events for <span className="text-brand-300 font-semibold">{currentUser?.name || 'Active User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">{rsvps.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Confirmed</div>
          </div>
          <button
            onClick={onExploreEvents}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs sm:text-sm font-semibold text-white transition-all shadow-lg shadow-brand-500/20"
          >
            <span>Discover More</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Event Reminder Settings Panel (MongoDB Persistence: User.reminderSettings) */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-surface-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Event Reminder Settings</span>
              {remindersSaved && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Settings Saved
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Configure notifications for your confirmed events (stored in MongoDB User Profile)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotify}
              onChange={(e) => setEmailNotify(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-white/20 bg-slate-800"
            />
            <span>Email Reminders</span>
          </label>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Notify me:</span>
            <select
              aria-label="Reminder notification lead time"
              value={hoursBefore}
              onChange={(e) => setHoursBefore(Number(e.target.value))}
              className="bg-slate-900 border border-white/15 rounded-lg text-white text-xs px-2.5 py-1 focus:ring-1 focus:ring-brand-500"
            >
              <option value={6}>6 hours before</option>
              <option value={12}>12 hours before</option>
              <option value={24}>24 hours before</option>
              <option value={48}>48 hours before</option>
            </select>
          </div>

          <button
            onClick={handleSaveReminders}
            disabled={isSavingReminders}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSavingReminders ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>

      {/* RSVPs List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 animate-pulse">
              <div className="h-32 bg-slate-800 rounded-xl" />
              <div className="h-5 bg-slate-800 rounded w-2/3" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : rsvps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Confirmed RSVPs Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              You haven't RSVP'd to any events yet. Check out the latest music, tech, and cultural events happening near you!
            </p>
          </div>
          <button
            onClick={onExploreEvents}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:from-brand-500 hover:to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Explore Event Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rsvps.map((rsvp) => {
            const ev = rsvp.eventSnapshot;
            const isDeleting = cancellingId === rsvp._id;
            const isCopied = copiedId === rsvp._id;
            const isSharing = sharingId === rsvp._id;

            return (
              <div
                key={rsvp._id}
                className="glow-card glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                    <img
                      src={ev.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>{ev.city}</span>
                    </div>

                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-xs font-bold text-emerald-300">
                      Status: {rsvp.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {ev.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: Share with Friends & Cancel RSVP */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleShareClick(rsvp)}
                    disabled={isSharing}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Invite</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCancel(rsvp._id)}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
