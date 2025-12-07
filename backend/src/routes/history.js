const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

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