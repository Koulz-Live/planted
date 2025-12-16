/**
 * Production Server for Planted Application
 * This file serves the built React frontend and handles API routes
 * Designed for Afrihost Node.js hosting environment
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import API routes from server
const aiRouter = require('./server/dist/routes/ai').default;
const aiEnhancedRouter = require('./server/dist/routes/aiEnhanced').default;
const profileRouter = require('./server/dist/routes/profile').default;
const contentRouter = require('./server/dist/routes/content').default;
const savedRouter = require('./server/dist/routes/saved').default;

// Initialize Firestore content seeding
const { seedContentIfNeeded } = require('./server/dist/services/firestoreContent');

const app = express();
const PORT = process.env.PORT || 3000;

// Get allowed origins from environment or use defaults
const clientOrigins = (process.env.ALLOWED_ORIGINS || 'https://planted.africa,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

// Middleware
app.use(cors({ 
  origin: clientOrigins,
  credentials: true 
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (optional - remove in production if not needed)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Seed Firestore content on startup
seedContentIfNeeded().catch(error => {
  console.warn('[Planted] Unable to seed Firestore content', error);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/ai-enhanced', aiEnhancedRouter);
app.use('/api/profile', profileRouter);
app.use('/api/content', contentRouter);
app.use('/api/saved', savedRouter);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded images and assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't handle API routes here
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Planted Error]', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌱 Planted Application Server                      ║
║                                                       ║
║   Environment: ${(process.env.NODE_ENV || 'production').padEnd(35)}║
║   Port: ${PORT.toString().padEnd(42)}║
║   Time: ${new Date().toLocaleString().padEnd(42)}║
║                                                       ║
║   API Endpoints:                                      ║
║   • GET  /api/health                                  ║
║   • POST /api/ai/*                                    ║
║   • POST /api/ai-enhanced/*                           ║
║   • *    /api/profile/*                               ║
║   • GET  /api/content/*                               ║
║   • *    /api/saved/*                                 ║
║                                                       ║
║   Frontend: Serving static React app                 ║
║   CORS Origins: ${clientOrigins.length} configured${' '.repeat(20)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Planted] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Planted] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
