import express from 'express';
import { config } from './config';
import { testConnection } from './db';
import projectRoutes from './routes/projectRoutes';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test DB connection on startup
testConnection();

// Routes
app.use('/api/projects', projectRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Project Management Service is healthy');
});

// Start server
app.listen(config.port, () => {
  console.log(`Project Management Service listening on port ${config.port}`);
});

