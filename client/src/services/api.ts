import { EventItem, User, RSVP, ShareLink, ShareLinkResolution } from '../types/index.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface EventQueryParams {
  city?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export const api = {
  // Event Feed
  async getEvents(params: EventQueryParams = {}): Promise<EventItem[]> {
    const searchParams = new URLSearchParams();
    if (params.city) searchParams.append('city', params.city);
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const res = await fetch(`${API_BASE_URL}/events?${searchParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to fetch events');
    }
    const json = await res.json();
    return json.data || [];
  },

  // Event Friends Count
  async getFriendsCount(eventId: string): Promise<number> {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}/friends-count`);
      if (!res.ok) return 0;
      const json = await res.json();
      return json?.data?.friendsAttendingCount || 0;
    } catch {
      return 0;
    }
  },

  // Users (for demo switcher)
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // RSVPs
  async getUserRSVPs(userId: string): Promise<RSVP[]> {
    const res = await fetch(`${API_BASE_URL}/rsvp/${encodeURIComponent(userId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to fetch confirmed RSVPs');
    }
    const json = await res.json();
    return json.data || [];
  },

  async createRSVP(payload: { userId: string; eventId: string; eventSnapshot: EventItem; status?: 'interested' | 'going' }): Promise<RSVP> {
    const res = await fetch(`${API_BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to submit RSVP');
    }
    const json = await res.json();
    return json.data;
  },

  async cancelRSVP(rsvpId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/rsvp/${encodeURIComponent(rsvpId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to cancel RSVP');
    }
  },

  // Friend Invite / Share Link
  async generateShareLink(payload: { rsvpId: string; userId: string }): Promise<{ token: string; shareUrl: string }> {
    const res = await fetch(`${API_BASE_URL}/share/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to generate share link');
    }
    const json = await res.json();
    return json.data;
  },

  async resolveShareLink(token: string, userId?: string): Promise<ShareLinkResolution> {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.append('userId', userId);

    const res = await fetch(`${API_BASE_URL}/share/${encodeURIComponent(token)}?${searchParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Invalid or expired invite link');
    }
    const json = await res.json();
    return json.data;
  },
};
