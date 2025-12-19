/**
 * Production Server for Planted Application (Firebase Optional Version)
 * This file serves the built React frontend and handles API routes
 * Designed for Afrihost Node.js hosting environment
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0-minimal',
    message: 'Frontend server running (backend routes disabled)'
  });
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded images and assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't handle API routes here
  if (req.path.startsWith('/api/')) {
    return res.status(503).json({ 
      error: 'Backend routes not available',
      message: 'Firebase/AI features require environment variables. Frontend is working.'
    });
  }
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[Planted] Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Planted Error]', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌱 Planted Frontend Server (Minimal)               ║
║                                                       ║
║   Environment: ${(process.env.NODE_ENV || 'production').padEnd(35)}║
║   Port: ${PORT.toString().padEnd(42)}║
║   Time: ${new Date().toLocaleString().padEnd(42)}║
║                                                       ║
║   Status: Frontend serving ✓                         ║
║   Backend: Disabled (needs Firebase env vars)        ║
║                                                       ║
║   Working:                                            ║
║   • GET  /api/health                                  ║
║   • Frontend at /                                     ║
║                                                       ║
║   Disabled (503):                                     ║
║   • /api/ai/*                                         ║
║   • /api/content/*                                    ║
║   • /api/profile/*                                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
  console.log('[Planted] ✓ Frontend server started successfully');
  console.log('[Planted] → Add Firebase env vars to enable backend features');
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
