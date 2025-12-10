const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { auth, optionalAuth } = require('../middleware/auth');

// History routes - allow guest access but enhance with user data if authenticated
router.use(optionalAuth);

// Get detailed history with filters
router.get('/', historyController.getHistory);

// Get analytics
router.get('/analytics', historyController.getAnalytics);

// Get archived screenings
router.get('/archived', historyController.getArchived);

// Manage individual screenings
router.put('/:id/notes', historyController.addNotes);
router.put('/:id/archive', historyController.archiveScreening);
router.put('/:id/unarchive', historyController.unarchiveScreening);

module.exports = router;