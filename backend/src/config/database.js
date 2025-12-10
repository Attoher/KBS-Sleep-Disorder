const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const DEMO_MODE = process.env.DEMO_MODE === 'true';
const POSTGRES_ENABLED = process.env.ENABLE_POSTGRES === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sleep_health_db',
  process.env.DB_USER || 'kbs_user',
  process.env.DB_PASSWORD || 'kbsPassword123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Avoid noisy connection attempts unless explicitly enabled
if (!DEMO_MODE && POSTGRES_ENABLED) {
  sequelize.authenticate()
    .then(() => console.log('[SUCCESS] PostgreSQL connected successfully'))
    .catch(err => console.error('[ERROR] PostgreSQL connection error:', err));
} else {
  console.warn('[WARNING] PostgreSQL init skipped (set ENABLE_POSTGRES=true to enable)');
}

module.exports = sequelize;