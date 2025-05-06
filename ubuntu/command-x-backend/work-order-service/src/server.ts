import express from 'express';
import { config } from './config';
import { testConnection } from './db';
import workOrderRoutes from './routes/workOrderRoutes';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test DB connection on startup
testConnection();

// Routes
app.use('/api/workorders', workOrderRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Work Order Service is healthy');
});

// Start server
app.listen(config.port, () => {
  console.log(`Work Order Service listening on port ${config.port}`);
});

