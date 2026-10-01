import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';

const startServer = async () => {
  await connectDB();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[EventPulse Server] Running on http://localhost:${config.port}`);
  });
};

startServer().catch((err) => {
  console.error('[EventPulse Server] Fatal startup error:', err);
  process.exit(1);
});
