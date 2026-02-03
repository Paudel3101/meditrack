const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const db = require('./utils/db');
const errorMiddleware = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
db.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Healthcare Management System API',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware.errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

module.exports = app;
