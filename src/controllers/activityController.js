const WorkoutLog = require('../models/WorkoutLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Log a workout
const logWorkout = async (req, res) => {
  try {
    const { duration, exercises, perceivedExertion, mood, notes } = req.body;

    if (!duration || !exercises || exercises.length === 0) {
      return errorResponse(res, 'Duration and exercises are required', 400);
    }

    const workoutLog = await WorkoutLog.create({
      user: req.user.id,
      duration,
      exercises,
      perceivedExertion,
      mood,
      notes,
      date: new Date()
    });

    return successResponse(res, workoutLog, 'Workout logged successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get workout history
const getWorkoutHistory = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(20);

    return successResponse(res, logs, 'Workout history fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get workout summary
const getWorkoutSummary = async (req, res) => {
  try {
    const summary = await WorkoutLog.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    return successResponse(res, summary[0] || { totalWorkouts: 0, totalDuration: 0, avgDuration: 0 }, 'Summary fetched');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  logWorkout,
  getWorkoutHistory,
  getWorkoutSummary
};