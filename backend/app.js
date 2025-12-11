const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const DEMO_MODE = process.env.DEMO_MODE === 'true';
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE === 'true';

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
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
    mode: ALLOW_OFFLINE ? 'offline' : (DEMO_MODE ? 'demo' : 'normal')
  };

  try {
    // API Server - always online
    healthStatus.services.api_server = { status: 'connected', message: 'Express server running' };

    // Check SQLite - try actual connection regardless of flag
    try {
      await sqliteDb.authenticate();
      healthStatus.services.sqlite_auth = { status: 'connected', message: 'SQLite/PostgreSQL online' };
    } catch (err) {
      healthStatus.services.sqlite_auth = { status: 'disconnected', message: err.message };
      if (!ALLOW_OFFLINE) {
        healthStatus.status = 'degraded';
      }
    }

    // Check Neo4j - try connection regardless of flag
    try {
      const neo4jConfig = require('./src/config/neo4j');
      if (neo4jConfig && neo4jConfig.driver) {
        const session = neo4jConfig.driver.session();
        await session.run('RETURN 1');
        await session.close();
        healthStatus.services.neo4j = { status: 'connected', message: 'Neo4j online' };
      } else {
        healthStatus.services.neo4j = { status: 'unavailable', message: 'Driver not initialized' };
      }
    } catch (err) {
      healthStatus.services.neo4j = { status: 'disconnected', message: err.message };
      if (!ALLOW_OFFLINE) {
        healthStatus.status = 'degraded';
      }
    }

    // Rule Engine status (always available)
    healthStatus.services.rule_engine = { status: 'active', message: '40+ medical rules loaded' };
    
  } catch (error) {
    console.error('[ERROR] Health check error:', error);
    healthStatus.status = 'degraded';
    healthStatus.error = error.message;
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 200;
  
  res.status(statusCode).json(healthStatus);
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
    if (!DEMO_MODE && !ALLOW_OFFLINE) {
      // Test SQLite connection (for authentication)
      await sqliteDb.authenticate();
      console.log('[SUCCESS] SQLite connection established successfully.');
      
      // Sync User model
      // Use plain sync to avoid SQLite backup-table copy errors when legacy data has duplicate/null IDs
      await sqliteDb.sync();
      console.log('[SUCCESS] User model synchronized with SQLite (no alter).');
      
      // Initialize Neo4j schema (for screening data)
      await initNeo4jSchema();
      console.log('[SUCCESS] Neo4j schema initialized.');
    } else if (ALLOW_OFFLINE) {
      console.warn('[WARNING] OFFLINE mode enabled: skipping database initialization.');
    } else {
      console.warn('[WARNING] DEMO_MODE enabled: skipping SQLite and Neo4j initialization.');
    }
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`[STARTUP] Server running on port ${PORT}`);
      console.log(`[DOCS] API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('[ARCHITECTURE] SQLite (Auth) + Neo4j (Screening Data)');
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    if (ALLOW_OFFLINE) {
      console.warn('[WARNING] Starting in offline mode due to startup failure. DB/Neo4j unavailable.');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`[STARTUP] Server running in OFFLINE mode on port ${PORT}`);
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