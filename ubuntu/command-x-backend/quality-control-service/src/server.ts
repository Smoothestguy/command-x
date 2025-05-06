import express from 'express';
import { config } from './config';
import { testConnection } from './db';
import qualityControlRoutes from './routes/qualityControlRoutes';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test DB connection on startup
testConnection();

// Routes
app.use('/api/quality', qualityControlRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Quality Control Service is healthy');
});

// Start server
app.listen(config.port, () => {
  console.log(`Quality Control Service listening on port ${config.port}`);
});

