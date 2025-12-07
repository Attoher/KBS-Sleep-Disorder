const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const DEMO_MODE = process.env.DEMO_MODE === 'true';

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

// Test connection unless in demo mode
if (!DEMO_MODE) {
  sequelize.authenticate()
    .then(() => console.log('✅ PostgreSQL connected successfully'))
    .catch(err => console.error('❌ PostgreSQL connection error:', err));
} else {
  console.warn('⚠️  DEMO_MODE enabled: skipping PostgreSQL connection test.');
}

module.exports = sequelize;