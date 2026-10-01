export interface EventSnapshot {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  city: string;
  imageUrl: string;
  friendsAttendingCount?: number;
}

export interface UserProfile {
  avatarUrl: string;
  preferences: string[];
}

export interface ReminderSettings {
  emailNotify: boolean;
  reminderHoursBefore: number;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  profile: UserProfile;
  reminderSettings: ReminderSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRSVP {
  _id?: string;
  userId: string;
  eventId: string;
  eventSnapshot: EventSnapshot;
  status: 'interested' | 'going';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShareLink {
  _id?: string;
  token: string;
  rsvpId: string;
  eventId: string;
  ownerUserId: string;
  clickCount: number;
  clickedByUserIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
