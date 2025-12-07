const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, optionalAuth } = require('../middleware/auth');

// Analytics overview (protected)
router.get(
  '/overview',
  auth,
  analyticsController.getOverview
);

// Rule analytics
router.get(
  '/rules',
  auth,
  analyticsController.getRuleAnalytics
);

// Trends over time
router.get(
  '/trends',
  auth,
  analyticsController.getTrends
);

// Predictive insights
router.get(
  '/insights',
  auth,
  analyticsController.getInsights
);

// Public analytics (limited)
router.get(
  '/public/overview',
  optionalAuth,
  analyticsController.getOverview
);

module.exports = router;