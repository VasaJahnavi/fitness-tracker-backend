const Recommendation = require('../models/Recommendation');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  generateWorkoutRecommendations,
  generateExerciseRecommendations,
  generateDailyActivityRecommendation
} = require('../utils/recommendationEngine');

// @desc    Get all recommendations for a user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recommendations = await Recommendation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recommendation.countDocuments(query);

    // Generate new recommendations if none exist
    if (recommendations.length === 0) {
      await generateAndSaveRecommendations(req.user.id);
      // Fetch again
      const newRecommendations = await Recommendation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      return successResponse(res, {
        recommendations: newRecommendations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: newRecommendations.length,
          pages: Math.ceil(newRecommendations.length / parseInt(limit))
        }
      }, 'Recommendations fetched successfully');
    }

    return successResponse(res, {
      recommendations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Recommendations fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get workout recommendations
// @route   GET /api/recommendations/workouts
// @access  Private
const getWorkoutRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const { limit = 5 } = req.query;

    const recommendations = await generateWorkoutRecommendations(user, parseInt(limit));

    // Save recommendations to database
    for (const rec of recommendations) {
      await Recommendation.create({
        user: user.id,
        type: 'workout-plan',
        recommendation: rec.workout,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore
      });
    }

    return successResponse(res, recommendations, 'Workout recommendations generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get exercise recommendations
// @route   GET /api/recommendations/exercises
// @access  Private
const getExerciseRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const { limit = 5 } = req.query;

    const recommendations = await generateExerciseRecommendations(user, parseInt(limit));

    // Save recommendations to database
    for (const rec of recommendations) {
      await Recommendation.create({
        user: user.id,
        type: 'exercise',
        recommendation: rec.exercise,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore
      });
    }

    return successResponse(res, recommendations, 'Exercise recommendations generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get daily activity recommendation
// @route   GET /api/recommendations/daily
// @access  Private
const getDailyRecommendation = async (req, res) => {
  try {
    const user = req.user;
    const recommendation = await generateDailyActivityRecommendation(user);

    // Save recommendation to database
    await Recommendation.create({
      user: user.id,
      type: 'daily-activity',
      recommendation: recommendation,
      reason: 'Based on your daily activity and workout history',
      confidenceScore: 0.9
    });

    return successResponse(res, recommendation, 'Daily recommendation generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Accept a recommendation
// @route   PUT /api/recommendations/:id/accept
// @access  Private
const acceptRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!recommendation) {
      return errorResponse(res, 'Recommendation not found', 404);
    }

    recommendation.isAccepted = true;
    await recommendation.save();

    return successResponse(res, recommendation, 'Recommendation accepted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Reject a recommendation
// @route   PUT /api/recommendations/:id/reject
// @access  Private
const rejectRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!recommendation) {
      return errorResponse(res, 'Recommendation not found', 404);
    }

    recommendation.isAccepted = false;
    await recommendation.save();

    return successResponse(res, recommendation, 'Recommendation rejected successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Generate and save recommendations
// @route   POST /api/recommendations/generate
// @access  Private
const generateAndSaveRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Generate workout recommendations
    const workoutRecs = await generateWorkoutRecommendations(user, 3);
    for (const rec of workoutRecs) {
      await Recommendation.create({
        user: userId,
        type: 'workout-plan',
        recommendation: rec.workout,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore
      });
    }

    // Generate exercise recommendations
    const exerciseRecs = await generateExerciseRecommendations(user, 3);
    for (const rec of exerciseRecs) {
      await Recommendation.create({
        user: userId,
        type: 'exercise',
        recommendation: rec.exercise,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore
      });
    }

    // Generate daily activity recommendation
    const dailyRec = await generateDailyActivityRecommendation(user);
    await Recommendation.create({
      user: userId,
      type: 'daily-activity',
      recommendation: dailyRec,
      reason: 'Based on your daily activity and workout history',
      confidenceScore: 0.9
    });

    return true;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return false;
  }
};

// @desc    Get recommendation stats
// @route   GET /api/recommendations/stats
// @access  Private
const getRecommendationStats = async (req, res) => {
  try {
    const stats = await Recommendation.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$isAccepted', true] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$isAccepted', false] }, 1, 0] }
          },
          viewed: {
            $sum: { $cond: [{ $eq: ['$isViewed', true] }, 1, 0] }
          },
          avgConfidence: { $avg: '$confidenceScore' }
        }
      }
    ]);

    const total = await Recommendation.countDocuments({ user: req.user.id });

    return successResponse(res, {
      stats,
      total,
      acceptanceRate: total > 0 ? 
        (stats.reduce((sum, s) => sum + s.accepted, 0) / total) * 100 : 0
    }, 'Recommendation stats fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getRecommendations,
  getWorkoutRecommendations,
  getExerciseRecommendations,
  getDailyRecommendation,
  acceptRecommendation,
  rejectRecommendation,
  generateAndSaveRecommendations,
  getRecommendationStats
};