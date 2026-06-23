const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getTodayWorkout,
  getWeeklySummary
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(protect);

router.get('/', getDashboard);
router.get('/today', getTodayWorkout);
router.get('/weekly', getWeeklySummary);

module.exports = router;