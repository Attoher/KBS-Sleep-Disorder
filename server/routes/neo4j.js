const express = require('express');
const router = express.Router();
const neo4jController = require('../controllers/neo4jController');

// Test Neo4j connection
router.get('/test', neo4jController.testConnection.bind(neo4jController));

// Initialize database schema
router.post('/init', neo4jController.initializeDatabase.bind(neo4jController));

// Get case history
router.get('/cases', neo4jController.getCases.bind(neo4jController));

// Get statistics
router.get('/stats', neo4jController.getStatistics.bind(neo4jController));

// Get system health
router.get('/health', neo4jController.getHealth.bind(neo4jController));

// Clear database (development only)
router.delete('/clear', neo4jController.clearDatabase.bind(neo4jController));

// Export router
module.exports = router;