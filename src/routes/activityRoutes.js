const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  logWorkout,
  getWorkoutHistory,
  getWorkoutSummary
} = require('../controllers/activityController');

// All routes require authentication
router.use(protect);

router.post('/', logWorkout);
router.get('/', getWorkoutHistory);
router.get('/summary', getWorkoutSummary);

module.exports = router;