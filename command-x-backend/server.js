require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const workOrderRoutes = require('./routes/workOrders');
const subcontractorRoutes = require('./routes/subcontractors');
const crewRoutes = require('./routes/crews');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const accountingRoutes = require('./routes/accounting');
const payItemRoutes = require('./routes/payItems');
const changeOrderRoutes = require('./routes/changeOrders');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for document uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/subcontractors', subcontractorRoutes);
app.use('/api/crews', crewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/pay-items', payItemRoutes);
app.use('/api/change-orders', changeOrderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing
