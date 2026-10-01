import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { ShareLinkResolution, EventItem } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { Sparkles, Calendar, Clock, MapPin, Heart, Check, Users, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface InviteLandingPageProps {
  token: string;
  onExplore: () => void;
  onRsvpSuccess: (event: EventItem) => void;
}

export const InviteLandingPage: React.FC<InviteLandingPageProps> = ({
  token,
  onExplore,
  onRsvpSuccess,
}) => {
  const { currentUser } = useUser();
  const [data, setData] = useState<ShareLinkResolution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRsvping, setIsRsvping] = useState(false);
  const [hasRsvpSuccess, setHasRsvpSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveToken = async () => {
      try {
        setIsLoading(true);
        // Pass the visitor's user id so backend atomically registers their visit and dedupes
        const result = await api.resolveShareLink(token, currentUser?._id);
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Invalid or expired invite link');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    resolveToken();

    return () => {
      isMounted = false;
    };
  }, [token, currentUser?._id]);

  const handleRsvpNow = async () => {
    if (!data?.event || !currentUser?._id) return;
    try {
      setIsRsvping(true);
      await api.createRSVP({
        userId: currentUser._id,
        eventId: data.event.id,
        eventSnapshot: data.event,
        status: 'interested',
      });
      setHasRsvpSuccess(true);
      onRsvpSuccess(data.event);
    } catch (err: any) {
      alert(err.message || 'Failed to submit RSVP');
    } finally {
      setIsRsvping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-slate-400 text-sm animate-pulse">Resolving Vibe Check invite...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center glass-panel rounded-3xl border border-red-500/20 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Invite Link Not Found</h2>
        <p className="text-xs text-slate-400">
          {error || 'This invite link may have expired or is invalid.'}
        </p>
        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white transition-all shadow-lg shadow-brand-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Events</span>
        </button>
      </div>
    );
  }

  const { event, ownerUser, shareLink } = data;

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6 animate-fade-in pb-16">
      {/* Return to feed button */}
      <button
        onClick={onExplore}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Feed</span>
      </button>

      {/* Inviter Greeting Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-brand-950/80 via-slate-900 to-indigo-950/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          {ownerUser?.avatarUrl ? (
            <img
              src={ownerUser.avatarUrl}
              alt={ownerUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-brand-400 shadow-lg shadow-brand-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {ownerUser?.name?.[0] || 'F'}
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>You've been invited!</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              <span className="text-brand-300">{ownerUser?.name || 'A friend'}</span> wants you there
            </h1>
            <p className="text-xs text-slate-400">
              They confirmed their attendance and sent you this Vibe Check invite.
            </p>
          </div>
        </div>

        {/* Live Vibe Check Counter */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-fuchsia-300 font-semibold">
            <Users className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            <span>
              {shareLink.clickedByUserIds.length} friends checked out this link
            </span>
          </div>
          <span className="text-slate-400">Total Clicks: {shareLink.clickCount}</span>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative h-64 w-full bg-slate-800">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>{event.city}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {event.title}
            </h2>
            <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="text-brand-400 font-semibold">Venue:</span> {event.venue}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <Calendar className="w-5 h-5 text-brand-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Date</div>
                <div className="text-sm font-bold text-white">{event.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Time</div>
                <div className="text-sm font-bold text-white">{event.time}</div>
              </div>
            </div>
          </div>

          {/* RSVP Call-to-Action */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {hasRsvpSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-emerald-300 font-bold text-base">
                  <Check className="w-5 h-5" />
                  <span>RSVP Confirmed!</span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  You're officially on the list for this event.
                </p>
              </div>
            ) : (
              <button
                onClick={handleRsvpNow}
                disabled={isRsvping}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-600 via-fuchsia-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50"
              >
                {isRsvping ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming RSVP...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-white/20" />
                    <span>I'm Down — RSVP Now</span>
                  </>
                )}
              </button>
            )}

            <p className="text-center text-xs text-slate-400">
              RSVPing as <strong className="text-white">{currentUser?.name || 'Guest'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
