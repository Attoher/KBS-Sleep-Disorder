const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public screening (with optional auth)
router.post(
  '/process',
  optionalAuth,
  screeningController.processScreening
);

// Protected screening routes
router.get(
  '/history',
  optionalAuth,
  screeningController.getUserHistory
);

router.get(
  '/:id',
  auth,
  screeningController.getScreeningById
);

router.delete(
  '/:id',
  optionalAuth,
  screeningController.deleteScreening
);

// Bulk deletion routes
router.post(
  '/delete-multiple',
  optionalAuth,
  screeningController.deleteMultipleScreenings
);

router.delete(
  '/delete-all',
  optionalAuth,
  screeningController.deleteAllScreenings
);

router.get(
  '/export',
  auth,
  screeningController.exportHistory
);

router.get(
  '/rules/info',
  auth,
  screeningController.getRuleEngineInfo
);

module.exports = router;