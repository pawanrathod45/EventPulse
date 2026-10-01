export interface EventItem {
  id: string;
  title: string;
  venue: string;
  date: string; // YYYY-MM-DD
  time: string;
  city: string;
  imageUrl: string;
  friendsAttendingCount: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profile: {
    avatarUrl: string;
    preferences: string[];
  };
  reminderSettings: {
    emailNotify: boolean;
    reminderHoursBefore: number;
  };
}

export interface RSVP {
  _id: string;
  userId: string;
  eventId: string;
  eventSnapshot: EventItem;
  status: 'interested' | 'going';
  createdAt: string;
}

export interface ShareLink {
  _id: string;
  token: string;
  rsvpId: string;
  eventId: string;
  ownerUserId: string;
  clickCount: number;
  clickedByUserIds: string[];
  createdAt: string;
}

export interface ShareLinkResolution {
  shareLink: ShareLink;
  event: EventItem;
  ownerUser?: {
    name: string;
    avatarUrl?: string;
  };
}
