const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Import database connections
const sqliteDb = require('./src/config/sqlite');
const { initNeo4jSchema } = require('./src/config/neo4j');

// Import routes
const authRoutes = require('./src/routes/auth');
const screeningRoutes = require('./src/routes/screening');
const historyRoutes = require('./src/routes/history');
const analyticsRoutes = require('./src/routes/analytics');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      sqlite_auth: DEMO_MODE ? 'skipped (demo mode)' : 'connected',
      neo4j: DEMO_MODE ? 'skipped (demo mode)' : 'connected'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server start
async function startServer() {
  try {
    if (!DEMO_MODE) {
      // Test SQLite connection (for authentication)
      await sqliteDb.authenticate();
      console.log('✅ SQLite connection established successfully.');
      
      // Sync User model
      await sqliteDb.sync({ alter: true });
      console.log('✅ User model synchronized with SQLite.');
      
      // Initialize Neo4j schema (for screening data)
      await initNeo4jSchema();
      console.log('✅ Neo4j schema initialized.');
    } else {
      console.warn('⚠️  DEMO_MODE enabled: skipping SQLite and Neo4j initialization.');
    }
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('🗄️  Architecture: SQLite (Auth) + Neo4j (Screening Data)');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (process.env.ALLOW_OFFLINE === 'true') {
      console.warn('⚠️  Starting in offline mode due to startup failure. DB/Neo4j unavailable.');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running in OFFLINE mode on port ${PORT}`);
      });
    } else {
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;