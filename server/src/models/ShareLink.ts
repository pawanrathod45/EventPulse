import mongoose, { Schema, Document } from 'mongoose';
import { IShareLink } from '../types/index.js';

export interface ShareLinkDocument extends Omit<IShareLink, '_id'>, Document {}

const ShareLinkSchema = new Schema<ShareLinkDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    rsvpId: { type: String, required: true, ref: 'RSVP', index: true },
    eventId: { type: String, required: true, index: true },
    ownerUserId: { type: String, required: true, ref: 'User', index: true },
    clickCount: { type: Number, default: 0 },
    clickedByUserIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const ShareLinkModel = mongoose.model<ShareLinkDocument>('ShareLink', ShareLinkSchema);
