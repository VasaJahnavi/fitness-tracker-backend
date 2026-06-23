const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validator');
const {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  getExercisesByMuscleGroup
} = require('../controllers/exerciseController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getExercises)
  .post(createExercise);

router.get('/muscle/:muscleGroup', getExercisesByMuscleGroup);

router.route('/:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

module.exports = router;