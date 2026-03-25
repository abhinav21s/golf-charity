/**
 * Golf Charity Platform - Backend Server
 * Express.js API with Supabase PostgreSQL
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const drawRoutes = require('./routes/drawRoutes');
const charityRoutes = require('./routes/charityRoutes');
const winnersRoutes = require('./routes/winnersRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
// Note: Webhook route needs raw body, so we handle it separately
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =====================================================
// ROUTES
// =====================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Golf Charity Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnersRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🏌️  Golf Charity Platform API');
  console.log('='.repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, you might want to exit the process
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
