const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAnalyticsSummary,
  getProgressData,
  getWorkoutAnalytics,
  getGoalAnalytics,
  getCalorieAnalytics,
  getPerformanceReport,
  getWorkoutTrends,
  getFitnessScore
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

router.get('/summary', getAnalyticsSummary);
router.get('/progress', getProgressData);
router.get('/workouts', getWorkoutAnalytics);
router.get('/goals', getGoalAnalytics);
router.get('/calories', getCalorieAnalytics);
router.get('/report', getPerformanceReport);
router.get('/trends', getWorkoutTrends);
router.get('/fitness-score', getFitnessScore);

module.exports = router;