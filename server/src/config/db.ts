import mongoose from 'mongoose';
import { config } from './index.js';
import { UserModel } from '../models/User.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedInitialUsersIfEmpty();
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};

async function seedInitialUsersIfEmpty() {
  try {
    const count = await UserModel.countDocuments();
    if (count === 0) {
      const demoUsers = [
        {
          name: 'Alex Rivera',
          email: 'alex.rivera@eventpulse.io',
          profile: {
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            preferences: ['Concerts', 'Tech', 'Festivals'],
          },
          reminderSettings: { emailNotify: true, reminderHoursBefore: 24 },
        },
        {
          name: 'Jordan Chen',
          email: 'jordan.chen@eventpulse.io',
          profile: {
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            preferences: ['Electronic Music', 'Art Shows'],
          },
          reminderSettings: { emailNotify: true, reminderHoursBefore: 12 },
        },
        {
          name: 'Taylor Reed',
          email: 'taylor.reed@eventpulse.io',
          profile: {
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            preferences: ['Comedy', 'Nightlife'],
          },
          reminderSettings: { emailNotify: false, reminderHoursBefore: 4 },
        },
      ];
      await UserModel.insertMany(demoUsers);
      console.log('[MongoDB] Seeded initial demo users for testing');
    }
  } catch (err) {
    console.warn('[MongoDB] Seed warning:', err);
  }
}
