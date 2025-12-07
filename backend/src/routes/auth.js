const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post(
  '/register',
  authController.validateRegistration(),
  authController.register
);

router.post(
  '/login',
  authController.validateLogin(),
  authController.login
);

// Protected routes
router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;