const Exercise = require('../models/Exercise');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Private (Admin/Trainer)
const createExercise = async (req, res) => {
  try {
    const { name, category, muscleGroup, difficultyLevel, caloriesPerMinute, description, instructions, equipmentNeeded } = req.body;

    // Check if exercise already exists
    const existingExercise = await Exercise.findOne({ name: name.toLowerCase() });
    if (existingExercise) {
      return errorResponse(res, 'Exercise already exists', 400);
    }

    const exercise = await Exercise.create({
      name,
      category,
      muscleGroup,
      difficultyLevel,
      caloriesPerMinute,
      description,
      instructions,
      equipmentNeeded,
      createdBy: req.user.id
    });

    return successResponse(res, exercise, 'Exercise created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all exercises with filters
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const { category, muscleGroup, difficultyLevel, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (muscleGroup) query.muscleGroup = { $in: [muscleGroup] };
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const exercises = await Exercise.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Exercise.countDocuments(query);

    return successResponse(res, {
      exercises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Exercises fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return errorResponse(res, 'Exercise not found', 404);
    }

    return successResponse(res, exercise, 'Exercise fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (Admin/Trainer)
const updateExercise = async (req, res) => {
  try {
    let exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return errorResponse(res, 'Exercise not found', 404);
    }

    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return successResponse(res, exercise, 'Exercise updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Delete exercise (soft delete)
// @route   DELETE /api/exercises/:id
// @access  Private (Admin/Trainer)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return errorResponse(res, 'Exercise not found', 404);
    }

    exercise.isActive = false;
    await exercise.save();

    return successResponse(res, null, 'Exercise deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get exercises by muscle group
// @route   GET /api/exercises/muscle/:muscleGroup
// @access  Private
const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { muscleGroup } = req.params;
    
    const exercises = await Exercise.find({
      muscleGroup: { $in: [muscleGroup] },
      isActive: true
    }).select('name category difficultyLevel caloriesPerMinute');

    return successResponse(res, exercises, `Exercises for ${muscleGroup} fetched successfully`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  getExercisesByMuscleGroup
};