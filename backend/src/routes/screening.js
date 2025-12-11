const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public screening (with optional auth)
router.post(
  '/process',
  optionalAuth,
  screeningController.processScreening.bind(screeningController)
);

// Protected screening routes
router.get(
  '/history',
  optionalAuth,
  screeningController.getUserHistory.bind(screeningController)
);

router.get(
  '/:id',
  auth,
  screeningController.getScreeningById.bind(screeningController)
);

router.delete(
  '/:id',
  auth,
  screeningController.deleteScreening.bind(screeningController)
);

router.get(
  '/export',
  auth,
  screeningController.exportHistory.bind(screeningController)
);

router.get(
  '/rules/info',
  auth,
  screeningController.getRuleEngineInfo.bind(screeningController)
);

module.exports = router;