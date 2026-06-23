const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, height, weight, fitnessLevel, fitnessGoals } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Update fields
    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (fitnessLevel) user.fitnessLevel = fitnessLevel;
    if (fitnessGoals) user.fitnessGoals = fitnessGoals;

    await user.save();

    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update health metrics
// @route   PUT /api/users/metrics
// @access  Private
const updateMetrics = async (req, res) => {
  try {
    const { height, weight, age } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (age) user.age = age;

    await user.save();

    // Calculate BMI
    const bmi = user.weight && user.height 
      ? (user.weight / ((user.height/100) ** 2)).toFixed(2)
      : null;

    return successResponse(res, {
      height: user.height,
      weight: user.weight,
      age: user.age,
      bmi
    }, 'Health metrics updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update fitness preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { preferredWorkoutDays, preferredWorkoutTime, preferredWorkoutTypes } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.preferences = {
      ...user.preferences,
      preferredWorkoutDays: preferredWorkoutDays || user.preferences.preferredWorkoutDays,
      preferredWorkoutTime: preferredWorkoutTime || user.preferences.preferredWorkoutTime,
      preferredWorkoutTypes: preferredWorkoutTypes || user.preferences.preferredWorkoutTypes
    };

    await user.save();

    return successResponse(res, user.preferences, 'Preferences updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get workout stats from the date range
    const dateRange = getDateRange(period);
    const workoutStats = await getWorkoutStats(userId, dateRange);

    const stats = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        profileCompletion: user.profileCompletion
      },
      workouts: {
        total: user.totalWorkouts || 0,
        totalCaloriesBurned: user.totalCaloriesBurned || 0,
        streakCount: user.streakCount || 0,
        lastWorkoutDate: user.lastWorkoutDate
      },
      period: {
        ...workoutStats
      }
    };

    return successResponse(res, stats, 'User statistics fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user.settings || {}, 'Settings fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { language, timezone, units, privacy } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (!user.settings) {
      user.settings = {};
    }

    if (language) user.settings.language = language;
    if (timezone) user.settings.timezone = timezone;
    if (units) user.settings.units = { ...user.settings.units, ...units };
    if (privacy) user.settings.privacy = { ...user.settings.privacy, ...privacy };

    await user.save();

    return successResponse(res, user.settings, 'Settings updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update user email
// @route   PUT /api/users/email
// @access  Private
const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid password', 401);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser.id !== user.id) {
      return errorResponse(res, 'Email already in use', 400);
    }

    user.email = newEmail;
    await user.save();

    return successResponse(res, { email: user.email }, 'Email updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get notification preferences
// @route   GET /api/users/notifications
// @access  Private
const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user.notificationPreferences || {}, 'Notification preferences fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    if (email) user.notificationPreferences.email = { ...user.notificationPreferences.email, ...email };
    if (push) user.notificationPreferences.push = { ...user.notificationPreferences.push, ...push };
    if (sms) user.notificationPreferences.sms = { ...user.notificationPreferences.sms, ...sms };

    await user.save();

    return successResponse(res, user.notificationPreferences, 'Notification preferences updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, confirm } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid password', 401);
    }

    // Delete user
    await user.deleteOne();

    return successResponse(res, null, 'Account deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ============ HELPER FUNCTIONS ============

const getDateRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }

  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const getWorkoutStats = async (userId, dateRange) => {
  const WorkoutLog = require('../models/WorkoutLog');
  
  const stats = await WorkoutLog.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$totalCaloriesBurned' },
        avgDuration: { $avg: '$duration' },
        avgCalories: { $avg: '$totalCaloriesBurned' }
      }
    }
  ]);

  return stats[0] || {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgDuration: 0,
    avgCalories: 0
  };
};

module.exports = {
  updateProfile,
  updateMetrics,
  updatePreferences,
  getUserStats,
  getUserSettings,
  updateSettings,
  updateEmail,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount
};