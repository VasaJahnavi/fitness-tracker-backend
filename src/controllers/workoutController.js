const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new workout plan
// @route   POST /api/workouts
// @access  Private
const createWorkoutPlan = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      difficultyLevel, 
      duration, 
      exercises, 
      tags,
      isPublic 
    } = req.body;

    // Validate required fields
    if (!name || !category || !duration || !exercises || exercises.length === 0) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    // Validate exercises exist
    let totalCalories = 0;
    for (let item of exercises) {
      const exercise = await Exercise.findById(item.exerciseId);
      if (!exercise) {
        return errorResponse(res, `Exercise with ID ${item.exerciseId} not found`, 404);
      }
      
      // Calculate calories if duration is provided
      if (item.duration && exercise.caloriesPerMinute) {
        totalCalories += exercise.caloriesPerMinute * item.duration;
      }
    }

    const workoutPlan = await WorkoutPlan.create({
      name,
      description,
      category,
      difficultyLevel: difficultyLevel || 'intermediate',
      duration,
      exercises,
      totalCalories,
      tags: tags || [],
      isPublic: isPublic || false,
      createdBy: req.user.id
    });

    // Populate exercise details
    const populatedWorkout = await WorkoutPlan.findById(workoutPlan._id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute');

    return successResponse(res, populatedWorkout, 'Workout plan created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all workout plans with filters
// @route   GET /api/workouts
// @access  Private
const getWorkoutPlans = async (req, res) => {
  try {
    const { 
      category, 
      difficultyLevel, 
      search, 
      page = 1, 
      limit = 10,
      isPublic,
      createdBy
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by difficulty level
    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    // Filter by public/private
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Filter by creator
    if (createdBy) {
      query.createdBy = createdBy;
    } else {
      // If no specific creator, show public workouts + user's own workouts
      query.$or = [
        { isPublic: true },
        { createdBy: req.user.id }
      ];
    }

    // Search by name or description
    if (search) {
      query.$or = query.$or || [];
      query.$or.push(
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workoutPlans = await WorkoutPlan.find(query)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await WorkoutPlan.countDocuments(query);

    return successResponse(res, {
      workoutPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Workout plans fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get single workout plan by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutPlanById = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute description')
      .populate('createdBy', 'name email fitnessLevel');

    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user has access to this workout
    if (!workoutPlan.isPublic && workoutPlan.createdBy._id.toString() !== req.user.id) {
      return errorResponse(res, 'You do not have access to this workout plan', 403);
    }

    return successResponse(res, workoutPlan, 'Workout plan fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update workout plan
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkoutPlan = async (req, res) => {
  try {
    let workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user owns this workout plan
    if (workoutPlan.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You are not authorized to update this workout plan', 403);
    }

    const { 
      name, 
      description, 
      category, 
      difficultyLevel, 
      duration, 
      exercises, 
      tags,
      isPublic 
    } = req.body;

    // If exercises are being updated, recalculate total calories
    let totalCalories = workoutPlan.totalCalories;
    if (exercises && exercises.length > 0) {
      totalCalories = 0;
      for (let item of exercises) {
        const exercise = await Exercise.findById(item.exerciseId);
        if (!exercise) {
          return errorResponse(res, `Exercise with ID ${item.exerciseId} not found`, 404);
        }
        if (item.duration && exercise.caloriesPerMinute) {
          totalCalories += exercise.caloriesPerMinute * item.duration;
        }
      }
    }

    // Update fields
    workoutPlan.name = name || workoutPlan.name;
    workoutPlan.description = description || workoutPlan.description;
    workoutPlan.category = category || workoutPlan.category;
    workoutPlan.difficultyLevel = difficultyLevel || workoutPlan.difficultyLevel;
    workoutPlan.duration = duration || workoutPlan.duration;
    workoutPlan.exercises = exercises || workoutPlan.exercises;
    workoutPlan.totalCalories = totalCalories;
    workoutPlan.tags = tags || workoutPlan.tags;
    workoutPlan.isPublic = isPublic !== undefined ? isPublic : workoutPlan.isPublic;

    await workoutPlan.save();

    // Populate exercise details
    const updatedWorkout = await WorkoutPlan.findById(workoutPlan._id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute');

    return successResponse(res, updatedWorkout, 'Workout plan updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Delete workout plan
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user owns this workout plan
    if (workoutPlan.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You are not authorized to delete this workout plan', 403);
    }

    await workoutPlan.deleteOne();

    return successResponse(res, null, 'Workout plan deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get workout plans by category
// @route   GET /api/workouts/category/:category
// @access  Private
const getWorkoutsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const query = {
      category: category,
      $or: [
        { isPublic: true },
        { createdBy: req.user.id }
      ]
    };

    const workoutPlans = await WorkoutPlan.find(query)
      .populate('exercises.exerciseId', 'name muscleGroup')
      .populate('createdBy', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, workoutPlans, `Workout plans for category ${category} fetched successfully`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get workout plans created by the current user
// @route   GET /api/workouts/my-workouts
// @access  Private
const getMyWorkoutPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { createdBy: req.user.id };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workoutPlans = await WorkoutPlan.find(query)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await WorkoutPlan.countDocuments(query);

    return successResponse(res, {
      workoutPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Your workout plans fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get public workout plans
// @route   GET /api/workouts/public
// @access  Private
const getPublicWorkoutPlans = async (req, res) => {
  try {
    const { category, difficultyLevel, page = 1, limit = 10 } = req.query;

    const query = { isPublic: true };
    if (category) query.category = category;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workoutPlans = await WorkoutPlan.find(query)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await WorkoutPlan.countDocuments(query);

    return successResponse(res, {
      workoutPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Public workout plans fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Add exercise to workout plan
// @route   POST /api/workouts/:id/exercises
// @access  Private
const addExerciseToWorkout = async (req, res) => {
  try {
    const { exerciseId, sets, reps, duration, restTime, order } = req.body;

    if (!exerciseId) {
      return errorResponse(res, 'Exercise ID is required', 400);
    }

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return errorResponse(res, 'Exercise not found', 404);
    }

    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user owns this workout plan
    if (workoutPlan.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You are not authorized to modify this workout plan', 403);
    }

    // Add exercise to workout
    workoutPlan.exercises.push({
      exerciseId,
      sets: sets || 3,
      reps: reps || 10,
      duration: duration || 0,
      restTime: restTime || 60,
      order: order || workoutPlan.exercises.length
    });

    // Recalculate total calories
    let totalCalories = 0;
    for (let item of workoutPlan.exercises) {
      const ex = await Exercise.findById(item.exerciseId);
      if (ex && item.duration) {
        totalCalories += ex.caloriesPerMinute * item.duration;
      }
    }
    workoutPlan.totalCalories = totalCalories;

    await workoutPlan.save();

    const updatedWorkout = await WorkoutPlan.findById(workoutPlan._id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute');

    return successResponse(res, updatedWorkout, 'Exercise added to workout plan successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Remove exercise from workout plan
// @route   DELETE /api/workouts/:workoutId/exercises/:exerciseId
// @access  Private
const removeExerciseFromWorkout = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.workoutId);
    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user owns this workout plan
    if (workoutPlan.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You are not authorized to modify this workout plan', 403);
    }

    // Remove exercise
    workoutPlan.exercises = workoutPlan.exercises.filter(
      item => item.exerciseId.toString() !== req.params.exerciseId
    );

    // Recalculate total calories
    let totalCalories = 0;
    for (let item of workoutPlan.exercises) {
      const ex = await Exercise.findById(item.exerciseId);
      if (ex && item.duration) {
        totalCalories += ex.caloriesPerMinute * item.duration;
      }
    }
    workoutPlan.totalCalories = totalCalories;

    await workoutPlan.save();

    const updatedWorkout = await WorkoutPlan.findById(workoutPlan._id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute');

    return successResponse(res, updatedWorkout, 'Exercise removed from workout plan successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Toggle workout plan visibility (public/private)
// @route   PUT /api/workouts/:id/toggle-visibility
// @access  Private
const toggleWorkoutVisibility = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    if (!workoutPlan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user owns this workout plan
    if (workoutPlan.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You are not authorized to modify this workout plan', 403);
    }

    workoutPlan.isPublic = !workoutPlan.isPublic;
    await workoutPlan.save();

    return successResponse(res, {
      isPublic: workoutPlan.isPublic,
      message: workoutPlan.isPublic ? 'Workout plan is now public' : 'Workout plan is now private'
    }, 'Workout visibility toggled successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Duplicate a workout plan
// @route   POST /api/workouts/:id/duplicate
// @access  Private
const duplicateWorkoutPlan = async (req, res) => {
  try {
    const originalWorkout = await WorkoutPlan.findById(req.params.id);
    if (!originalWorkout) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    // Check if user has access
    if (!originalWorkout.isPublic && originalWorkout.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'You do not have access to this workout plan', 403);
    }

    // Create duplicate
    const duplicatedWorkout = new WorkoutPlan({
      name: `${originalWorkout.name} (Copy)`,
      description: originalWorkout.description,
      category: originalWorkout.category,
      difficultyLevel: originalWorkout.difficultyLevel,
      duration: originalWorkout.duration,
      exercises: originalWorkout.exercises,
      totalCalories: originalWorkout.totalCalories,
      tags: originalWorkout.tags,
      isPublic: false, // Duplicate is always private by default
      createdBy: req.user.id
    });

    await duplicatedWorkout.save();

    const populatedWorkout = await WorkoutPlan.findById(duplicatedWorkout._id)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute');

    return successResponse(res, populatedWorkout, 'Workout plan duplicated successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
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
};