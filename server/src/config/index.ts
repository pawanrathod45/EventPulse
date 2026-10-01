import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eventpulse',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || '',
};
