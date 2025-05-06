import express from 'express';
import { config } from './config';
import { testConnection } from './db';
import financialRoutes from './routes/financialRoutes';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test DB connection on startup
testConnection();

// Routes
app.use('/api/financials', financialRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Financial Service is healthy');
});

// Start server
app.listen(config.port, () => {
  console.log(`Financial Service listening on port ${config.port}`);
});

