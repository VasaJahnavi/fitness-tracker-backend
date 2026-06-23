const User = require('../models/User');
const WorkoutLog = require('../models/WorkoutLog');
const Goal = require('../models/Goal');
const WorkoutPlan = require('../models/WorkoutPlan');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateDailyActivityRecommendation } = require('../utils/recommendationEngine');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findById(userId);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's workout
    const todayWorkout = await WorkoutLog.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('exercises.exerciseId', 'name category');

    // Get weekly activity
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weeklyWorkouts = await WorkoutLog.find({
      user: userId,
      date: { $gte: weekStart, $lt: tomorrow }
    })
    .sort({ date: -1 });

    // Get weekly summary
    const weeklySummary = {
      totalWorkouts: weeklyWorkouts.length,
      totalCalories: weeklyWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0),
      totalDuration: weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0),
      daysActive: new Set(weeklyWorkouts.map(w => w.date.toDateString())).size
    };

    // Get active goals
    const activeGoals = await Goal.find({
      user: userId,
      status: 'active'
    })
    .sort({ targetDate: 1 })
    .limit(3);

    // Get recent workouts
    const recentWorkouts = await WorkoutLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .populate('exercises.exerciseId', 'name');

    // Get workout recommendations
    const dailyRecommendation = await generateDailyActivityRecommendation(user);

    // Get user progress metrics
    const progressMetrics = await getProgressMetrics(userId);

    // Get workout streaks
    const streak = await getStreakData(userId);

    // Get workout plan suggestions
    const suggestedWorkouts = await WorkoutPlan.find({
      isPublic: true,
      difficultyLevel: user.fitnessLevel || 'beginner'
    })
    .limit(3)
    .populate('exercises.exerciseId', 'name');

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        profileCompletion: user.profileCompletion
      },
      today: {
        workout: todayWorkout || null,
        recommendation: dailyRecommendation
      },
      weekly: weeklySummary,
      goals: {
        active: activeGoals,
        stats: await getGoalStats(userId)
      },
      recentWorkouts,
      progress: progressMetrics,
      streak,
      suggestedWorkouts
    };

    return successResponse(res, dashboardData, 'Dashboard data fetched successfully');
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get today's workout plan
// @route   GET /api/dashboard/today
// @access  Private
const getTodayWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWorkout = await WorkoutLog.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('exercises.exerciseId', 'name category muscleGroup')
    .populate('workoutPlanId', 'name category');

    return successResponse(res, todayWorkout || null, 'Today\'s workout fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get weekly summary
// @route   GET /api/dashboard/weekly
// @access  Private
const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const weeklyWorkouts = await WorkoutLog.find({
      user: userId,
      date: { $gte: weekStart }
    })
    .sort({ date: 1 });

    // Group by day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData = days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const workouts = weeklyWorkouts.filter(w => 
        w.date >= dayStart && w.date <= dayEnd
      );

      return {
        day,
        date: date.toISOString().split('T')[0],
        workoutCount: workouts.length,
        calories: workouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0),
        duration: workouts.reduce((sum, w) => sum + w.duration, 0)
      };
    });

    const summary = {
      days: dayData,
      total: {
        workouts: weeklyWorkouts.length,
        calories: weeklyWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0),
        duration: weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0)
      }
    };

    return successResponse(res, summary, 'Weekly summary fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get progress metrics
// @route   GET /api/dashboard/progress
// @access  Private
const getProgressMetrics = async (userId) => {
  try {
    // Get last 30 days of workouts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await WorkoutLog.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    })
    .sort({ date: 1 });

    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

    // Calculate improvement metrics
    const midPoint = Math.floor(workouts.length / 2);
    const firstHalf = workouts.slice(0, midPoint);
    const secondHalf = workouts.slice(midPoint);

    const avgDurationFirst = firstHalf.reduce((sum, w) => sum + w.duration, 0) / (firstHalf.length || 1);
    const avgDurationSecond = secondHalf.reduce((sum, w) => sum + w.duration, 0) / (secondHalf.length || 1);
    
    const avgCaloriesFirst = firstHalf.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (firstHalf.length || 1);
    const avgCaloriesSecond = secondHalf.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (secondHalf.length || 1);

    return {
      totalWorkouts,
      totalCalories,
      totalDuration,
      avgDuration: totalDuration / (totalWorkouts || 1),
      avgCalories: totalCalories / (totalWorkouts || 1),
      improvement: {
        duration: avgDurationSecond - avgDurationFirst,
        calories: avgCaloriesSecond - avgCaloriesFirst,
        consistency: totalWorkouts > 10 ? 'good' : totalWorkouts > 5 ? 'moderate' : 'needs-improvement'
      }
    };
  } catch (error) {
    console.error('Error getting progress metrics:', error);
    return {
      totalWorkouts: 0,
      totalCalories: 0,
      totalDuration: 0,
      avgDuration: 0,
      avgCalories: 0,
      improvement: {
        duration: 0,
        calories: 0,
        consistency: 'needs-improvement'
      }
    };
  }
};

// @desc    Get streak data
// @route   GET /api/dashboard/streak
// @access  Private
const getStreakData = async (userId) => {
  try {
    const user = await User.findById(userId);
    const streak = user.streakCount || 0;

    // Calculate longest streak
    const workouts = await WorkoutLog.find({ user: userId })
      .sort({ date: -1 });

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate = null;

    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        currentStreak = 1;
        lastDate = workoutDate;
      } else {
        const diffDays = Math.floor((lastDate - workoutDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    return {
      current: streak,
      longest: longestStreak || streak
    };
  } catch (error) {
    console.error('Error getting streak data:', error);
    return {
      current: 0,
      longest: 0
    };
  }
};

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
  getDashboard,
  getTodayWorkout,
  getWeeklySummary,
  getProgressMetrics,
  getStreakData
};