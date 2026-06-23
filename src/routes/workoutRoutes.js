const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validator');
const {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getWorkoutsByCategory,
  getMyWorkoutPlans,
  getPublicWorkoutPlans,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  toggleWorkoutVisibility,
  duplicateWorkoutPlan
} = require('../controllers/workoutController');

// All routes require authentication
router.use(protect);

// Special routes (must come before /:id routes)
router.get('/my-workouts', getMyWorkoutPlans);
router.get('/public', getPublicWorkoutPlans);
router.get('/category/:category', getWorkoutsByCategory);

// Main workout routes
router.route('/')
  .get(getWorkoutPlans)
  .post(createWorkoutPlan);

// Workout plan actions
router.post('/:id/duplicate', duplicateWorkoutPlan);
router.put('/:id/toggle-visibility', toggleWorkoutVisibility);
router.post('/:id/exercises', addExerciseToWorkout);
router.delete('/:workoutId/exercises/:exerciseId', removeExerciseFromWorkout);

// Workout by ID routes
router.route('/:id')
  .get(getWorkoutPlanById)
  .put(updateWorkoutPlan)
  .delete(deleteWorkoutPlan);

module.exports = router;