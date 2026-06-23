const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validator');
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalStats
} = require('../controllers/goalController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.get('/stats', getGoalStats);

router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

router.put('/:id/progress', updateGoalProgress);

module.exports = router;