const sqliteDb = require('../config/sqlite');
const User = require('./User');

// No need for Sequelize associations since we only have User in SQLite
// Screening data is stored in Neo4j via neo4jScreeningService

module.exports = {
  sqliteDb,
  User
};
