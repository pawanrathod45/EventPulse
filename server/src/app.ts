import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'EventPulse API', timestamp: new Date().toISOString() });
  });

  // Base API routes
  app.use('/api/users', userRoutes);

  // Central error handling
  app.use(errorHandler);

  return app;
};
