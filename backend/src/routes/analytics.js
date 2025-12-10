const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, optionalAuth } = require('../middleware/auth');

// Analytics overview (optional auth - allow public/guest access)
router.get(
  '/overview',
  optionalAuth,
  analyticsController.getOverview
);

// Rule analytics (optional auth)
router.get(
  '/rules',
  optionalAuth,
  analyticsController.getRuleAnalytics
);

// Trends over time (optional auth)
router.get(
  '/trends',
  optionalAuth,
  analyticsController.getTrends
);

// Predictive insights (optional auth)
router.get(
  '/insights',
  optionalAuth,
  analyticsController.getInsights
);

// Public analytics (limited)
router.get(
  '/public/overview',
  optionalAuth,
  analyticsController.getOverview
);

module.exports = router;