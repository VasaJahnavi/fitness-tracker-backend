const Goal = require('../models/Goal');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { type, targetValue, targetUnit, targetDate, notes } = req.body;

    // Check for existing active goal of same type
    const existingGoal = await Goal.findOne({
      user: req.user.id,
      type,
      status: 'active'
    });

    if (existingGoal) {
      return errorResponse(res, `You already have an active ${type} goal`, 400);
    }

    const goal = await Goal.create({
      user: req.user.id,
      type,
      targetValue,
      targetUnit,
      targetDate,
      notes
    });

    return successResponse(res, goal, 'Goal created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Goal.countDocuments(query);

    // Calculate goal statistics
    const stats = await getGoalStats(req.user.id);

    return successResponse(res, {
      goals,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Goals fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    return successResponse(res, goal, 'Goal fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    const { type, targetValue, targetUnit, targetDate, status, notes } = req.body;

    // Update fields
    if (type) goal.type = type;
    if (targetValue) goal.targetValue = targetValue;
    if (targetUnit) goal.targetUnit = targetUnit;
    if (targetDate) goal.targetDate = targetDate;
    if (status) {
      goal.status = status;
      if (status === 'completed') {
        goal.completionDate = new Date();
        goal.progress = 100;
      }
    }
    if (notes) goal.notes = notes;

    await goal.save();

    return successResponse(res, goal, 'Goal updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    await goal.deleteOne();

    return successResponse(res, null, 'Goal deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
const updateGoalProgress = async (req, res) => {
  try {
    const { currentValue } = req.body;

    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    if (goal.status !== 'active') {
      return errorResponse(res, 'Cannot update progress for a completed or failed goal', 400);
    }

    goal.currentValue = currentValue;
    goal.progress = Math.min((currentValue / goal.targetValue) * 100, 100);

    // Check if goal is completed
    if (goal.progress >= 100) {
      goal.status = 'completed';
      goal.completionDate = new Date();
      goal.progress = 100;
    }

    await goal.save();

    return successResponse(res, goal, 'Goal progress updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
const getGoalStats = async (userId) => {
  try {
    const stats = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const total = await Goal.countDocuments({ user: userId });
    const active = stats.find(s => s._id === 'active')?.count || 0;
    const completed = stats.find(s => s._id === 'completed')?.count || 0;
    const failed = stats.find(s => s._id === 'failed')?.count || 0;

    return {
      total,
      active,
      completed,
      failed,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting goal stats:', error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      failed: 0,
      completionRate: 0
    };
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalStats
};