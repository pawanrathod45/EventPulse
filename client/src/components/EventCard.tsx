import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Heart, Share2, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { EventItem, RSVP } from '../types/index.ts';
import { api } from '../services/api.ts';

interface EventCardProps {
  event: EventItem;
  userRsvp?: RSVP;
  onRsvp: (event: EventItem) => Promise<void>;
  onShare: (rsvpId: string, eventId: string) => Promise<string | null>;
  isRsvpLoading?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  userRsvp,
  onRsvp,
  onShare,
  isRsvpLoading = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Directly query the friends count endpoint: GET /api/events/:id/friends-count
  const { data: friendsCount = event.friendsAttendingCount || 0 } = useQuery({
    queryKey: ['friends-count', event.id],
    queryFn: () => api.getFriendsCount(event.id),
    initialData: event.friendsAttendingCount || 0,
    refetchInterval: 5000, // keep live in real-time
  });

  const isConfirmed = Boolean(userRsvp);

  const handleShareClick = async () => {
    if (!userRsvp?._id) return;
    try {
      setIsSharing(true);
      const url = await onShare(userRsvp._id, event.id);
      if (url) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Format date display (e.g., Sat, Oct 5, 2026)
  const formattedDate = React.useMemo(() => {
    if (!event.date) return 'TBA';
    try {
      const [y, m, d] = event.date.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return event.date;
    }
  }, [event.date]);

  return (
    <div className="glow-card glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col group h-full">
      {/* Event Image Banner with City & Friends Badge */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-800">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

        {/* City pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span>{event.city}</span>
        </div>

        {/* Friends Attending Badge (Sourced from GET /api/events/:id/friends-count) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-950/80 backdrop-blur-md border border-fuchsia-500/40 text-xs font-bold text-fuchsia-200 shadow-lg shadow-fuchsia-950/50">
          <Users className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          <span>Friends Attending: {friendsCount}</span>
        </div>

        {/* Date & Time ribbon */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-medium text-white">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-white">{event.time}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-brand-400 font-medium">@</span> {event.venue}
          </p>
        </div>

        {/* Action Buttons: Interested (RSVP) & Share with Friends */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          {!isConfirmed ? (
            <button
              onClick={() => onRsvp(event)}
              disabled={isRsvpLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:from-brand-500 hover:to-fuchsia-500 active:scale-[0.99] transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
            >
              {isRsvpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving RSVP...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white/20" />
                  <span>Interested (RSVP)</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              {/* Confirmed RSVP badge */}
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>RSVP Confirmed ({userRsvp?.status || 'interested'})</span>
              </div>

              {/* Share with Friends Button */}
              <button
                onClick={handleShareClick}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Link...</span>
                  </>
                ) : isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Invite Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share with Friends</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
