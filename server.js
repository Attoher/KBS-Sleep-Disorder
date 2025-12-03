require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const diagnosisRoutes = require('./server/routes/diagnosis');
const neo4jRoutes = require('./server/routes/neo4j');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * 1) SECURITY & BASIC MIDDLEWARE
 */

// Security headers + simple CSP (biar font & icon CDN tetap jalan)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"
        ],
        "font-src": [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        "img-src": ["'self'", "data:"]
      }
    }
  })
);

// CORS – sebenarnya tidak terlalu perlu kalau satu origin,
// tapi tidak apa-apa dibiarkan longgar untuk dev.
app.use(cors());

// Rate limit khusus endpoint /api (biar ga bisa di-spam)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,                 // max 100 request / IP / window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging HTTP (skip saat test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/**
 * 2) API ROUTES
 */

app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/neo4j', neo4jRoutes);

/**
 * 3) FRONTEND STATIC (SATU PORT)
 *
 * Serve file dari client/public lewat Express
 * sehingga app bisa diakses dari http://localhost:5000
 */

const publicPath = path.join(__dirname, 'client', 'public');
app.use(express.static(publicPath));

// Semua request non-API diarahkan ke index.html (SPA-style)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

/**
 * 4) ERROR HANDLER
 */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * 5) START SERVER
 */

app.listen(PORT, () => {
  console.log("\n==============================================");
  console.log("🚀 Sleep Health KBS Server is running!");
  console.log(`🌐 Open the app: http://localhost:${PORT}`);  
  console.log("📁 Ready for development");
  console.log("==============================================\n");
});

