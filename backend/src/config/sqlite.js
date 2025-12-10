const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Create SQLite instance for authentication only
const sqliteDb = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_PATH || path.join(__dirname, '../../data/auth.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

// Test connection
if (process.env.DEMO_MODE !== 'true') {
  sqliteDb.authenticate()
    .then(() => console.log('✅ SQLite connected successfully'))
    .catch(err => console.error('❌ SQLite connection error:', err));
}

module.exports = sqliteDb;
