import mongoose, { Schema, Document } from 'mongoose';
import { IRSVP } from '../types/index.js';

export interface RSVPDocument extends Omit<IRSVP, '_id'>, Document {}

const EventSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    venue: { type: String, default: 'TBA' },
    date: { type: String, required: true },
    time: { type: String, default: 'TBA' },
    city: { type: String, default: 'Local' },
    imageUrl: { type: String, default: '' },
    friendsAttendingCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const RSVPSchema = new Schema<RSVPDocument>(
  {
    userId: { type: String, required: true, ref: 'User', index: true },
    eventId: { type: String, required: true, index: true },
    eventSnapshot: { type: EventSnapshotSchema, required: true },
    status: {
      type: String,
      enum: ['interested', 'going'],
      default: 'interested',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a user can only have one RSVP record per event
RSVPSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const RSVPModel = mongoose.model<RSVPDocument>('RSVP', RSVPSchema);
