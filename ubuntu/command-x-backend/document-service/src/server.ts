import express from 'express';
import { config } from './config';
import { testConnection } from './db';
import documentRoutes from './routes/documentRoutes';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Handle form-data potentially used with uploads

// Test DB connection on startup
testConnection();

// Routes
app.use('/api/documents', documentRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Document Service is healthy');
});

// Serve locally stored files (if using LOCAL storage)
// This is a basic example; consider security and efficiency for production
if (config.storageType === 'LOCAL') {
    app.use('/uploads', express.static(config.localStoragePath));
    console.log(`Serving local uploads from ${config.localStoragePath} at /uploads`);
}

// Start server
app.listen(config.port, () => {
  console.log(`Document Service listening on port ${config.port}`);
});

