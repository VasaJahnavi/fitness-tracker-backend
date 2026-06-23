const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecommendations,
  getWorkoutRecommendations,
  getExerciseRecommendations,
  getDailyRecommendation,
  acceptRecommendation,
  rejectRecommendation,
  generateAndSaveRecommendations,
  getRecommendationStats
} = require('../controllers/recommendationController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getRecommendations);

router.get('/workouts', getWorkoutRecommendations);
router.get('/exercises', getExerciseRecommendations);
router.get('/daily', getDailyRecommendation);
router.get('/stats', getRecommendationStats);

router.post('/generate', generateAndSaveRecommendations);

router.put('/:id/accept', acceptRecommendation);
router.put('/:id/reject', rejectRecommendation);

module.exports = router;