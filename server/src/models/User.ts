import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/index.js';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    profile: {
      avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      preferences: { type: [String], default: [] },
    },
    reminderSettings: {
      emailNotify: { type: Boolean, default: true },
      reminderHoursBefore: { type: Number, default: 24 },
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
