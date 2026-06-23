const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validator');  // ← Make sure this line is correct
const {
  userProfileValidation,
  userMetricsValidation,
  userPreferencesValidation,
  userSettingsValidation,
  userStatsValidation,
  userEmailUpdateValidation,
  userNotificationPreferencesValidation
} = require('../validations');
const {
  updateProfile,
  updateMetrics,
  updatePreferences,
  getUserStats,
  getUserSettings,
  updateSettings,
  updateEmail,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Profile routes
router.put('/profile', validate(userProfileValidation), updateProfile);

// Metrics routes
router.put('/metrics', validate(userMetricsValidation), updateMetrics);

// Preferences routes
router.put('/preferences', validate(userPreferencesValidation), updatePreferences);

// Settings routes
router.get('/settings', getUserSettings);
router.put('/settings', validate(userSettingsValidation), updateSettings);

// Stats routes
router.get('/stats', validateQuery(userStatsValidation), getUserStats);

// Email update
router.put('/email', validate(userEmailUpdateValidation), updateEmail);

// Notification preferences
router.get('/notifications', getNotificationPreferences);
router.put('/notifications', validate(userNotificationPreferencesValidation), updateNotificationPreferences);

// Account deletion
router.delete('/account', deleteAccount);

module.exports = router;