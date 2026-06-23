const WorkoutLog = require('../models/WorkoutLog');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    // Get date range based on period
    const dateRange = getDateRange(period);
    
    // Get workout analytics
    const workoutStats = await getWorkoutStats(userId, dateRange);
    
    // Get goal analytics
    const goalStats = await getGoalStats(userId);
    
    // Get user progress
    const userProgress = await getUserProgress(userId, dateRange);
    
    // Get calorie analytics
    const calorieStats = await getCalorieStats(userId, dateRange);
    
    // Get fitness score
    const fitnessScore = await calculateFitnessScore(userId);

    const summary = {
      period,
      dateRange,
      workouts: workoutStats,
      goals: goalStats,
      progress: userProgress,
      calories: calorieStats,
      fitnessScore,
      streak: await getStreakData(userId)
    };

    return successResponse(res, summary, 'Analytics summary fetched successfully');
  } catch (error) {
    console.error('Analytics summary error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get progress data for charts
// @route   GET /api/analytics/progress
// @access  Private
const getProgressData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      metric = 'workouts', 
      period = 'month',
      startDate,
      endDate 
    } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    let progressData = [];

    switch (metric) {
      case 'workouts':
        progressData = await getWorkoutsProgress(userId, dateRange);
        break;
      case 'calories':
        progressData = await getCaloriesProgress(userId, dateRange);
        break;
      case 'duration':
        progressData = await getDurationProgress(userId, dateRange);
        break;
      case 'weight':
        progressData = await getWeightProgress(userId, dateRange);
        break;
      case 'strength':
        progressData = await getStrengthProgress(userId, dateRange);
        break;
      default:
        progressData = await getWorkoutsProgress(userId, dateRange);
    }

    return successResponse(res, {
      metric,
      period,
      data: progressData
    }, 'Progress data fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get workout analytics
// @route   GET /api/analytics/workouts
// @access  Private
const getWorkoutAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    const dateRange = getDateRange(period);

    const analytics = await WorkoutLog.aggregate([
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
          avgDuration: { $avg: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgCalories: { $avg: '$totalCaloriesBurned' },
          maxCalories: { $max: '$totalCaloriesBurned' },
          minCalories: { $min: '$totalCaloriesBurned' },
          avgPerceivedExertion: { $avg: '$perceivedExertion' },
          moodDistribution: {
            $push: '$mood'
          }
        }
      }
    ]);

    // Get workout type distribution
    const typeDistribution = await WorkoutLog.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$workoutPlanId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'workoutplans',
          localField: '_id',
          foreignField: '_id',
          as: 'workoutPlan'
        }
      },
      {
        $unwind: {
          path: '$workoutPlan',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$workoutPlan.category',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = analytics[0] || {
      totalWorkouts: 0,
      totalDuration: 0,
      avgDuration: 0,
      totalCalories: 0,
      avgCalories: 0,
      maxCalories: 0,
      minCalories: 0,
      avgPerceivedExertion: 0,
      moodDistribution: []
    };

    // Calculate mood distribution
    const moods = ['great', 'good', 'okay', 'tired', 'exhausted'];
    const moodDistribution = moods.reduce((acc, mood) => {
      acc[mood] = 0;
      return acc;
    }, {});

    result.moodDistribution.forEach(mood => {
      if (mood && moodDistribution[mood] !== undefined) {
        moodDistribution[mood]++;
      }
    });

    return successResponse(res, {
      summary: {
        ...result,
        moodDistribution
      },
      typeDistribution: typeDistribution.filter(t => t._id !== null),
      period
    }, 'Workout analytics fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get goal analytics
// @route   GET /api/analytics/goals
// @access  Private
const getGoalAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ user: userId });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const failedGoals = goals.filter(g => g.status === 'failed').length;

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Group by goal type
    const typeStats = goals.reduce((acc, goal) => {
      if (!acc[goal.type]) {
        acc[goal.type] = {
          total: 0,
          completed: 0,
          active: 0,
          failed: 0
        };
      }
      acc[goal.type].total++;
      if (goal.status === 'completed') acc[goal.type].completed++;
      if (goal.status === 'active') acc[goal.type].active++;
      if (goal.status === 'failed') acc[goal.type].failed++;
      return acc;
    }, {});

    // Calculate average progress
    const avgProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / (totalGoals || 1);

    // Calculate time to complete goals (average days)
    const completedGoalsWithDates = goals.filter(g => g.status === 'completed' && g.completionDate);
    const avgDaysToComplete = completedGoalsWithDates.length > 0
      ? completedGoalsWithDates.reduce((sum, goal) => {
          const days = Math.floor((goal.completionDate - goal.startDate) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedGoalsWithDates.length
      : 0;

    return successResponse(res, {
      summary: {
        totalGoals,
        completedGoals,
        activeGoals,
        failedGoals,
        completionRate: Math.round(completionRate * 100) / 100,
        avgProgress: Math.round(avgProgress * 100) / 100,
        avgDaysToComplete: Math.round(avgDaysToComplete)
      },
      typeStats
    }, 'Goal analytics fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get calorie analytics
// @route   GET /api/analytics/calories
// @access  Private
const getCalorieAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    const dateRange = getDateRange(period);

    const calorieStats = await WorkoutLog.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgCalories: { $avg: '$totalCaloriesBurned' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Calculate weekly and monthly averages
    const totalCalories = calorieStats.reduce((sum, day) => sum + day.totalCalories, 0);
    const daysWithWorkouts = calorieStats.filter(day => day.totalCalories > 0).length;
    const avgDailyCalories = daysWithWorkouts > 0 ? totalCalories / daysWithWorkouts : 0;

    // Calculate calorie trends (week over week)
    const weeks = [];
    const currentDate = new Date(dateRange.end);
    const startDate = new Date(dateRange.start);

    while (currentDate >= startDate) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - 6);
      const weekEnd = new Date(currentDate);

      const weekData = calorieStats.filter(day => {
        const date = new Date(day._id);
        return date >= weekStart && date <= weekEnd;
      });

      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalCalories: weekData.reduce((sum, day) => sum + day.totalCalories, 0),
        workouts: weekData.length
      });

      currentDate.setDate(currentDate.getDate() - 7);
    }

    return successResponse(res, {
      period,
      summary: {
        totalCalories,
        avgDailyCalories: Math.round(avgDailyCalories * 100) / 100,
        daysWithWorkouts,
        totalDays: Math.floor((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1
      },
      dailyData: calorieStats,
      weeklyData: weeks.reverse()
    }, 'Calorie analytics fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Generate performance report
// @route   GET /api/analytics/report
// @access  Private
const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    const dateRange = getDateRange(period);

    // Get all data for the report
    const [workoutData, goalData, progressData, userData] = await Promise.all([
      getWorkoutStats(userId, dateRange),
      getGoalStats(userId),
      getUserProgress(userId, dateRange),
      User.findById(userId).select('name email fitnessLevel weight height age')
    ]);

    // Calculate improvements
    const improvements = await calculateImprovements(userId, dateRange);

    // Generate report
    const report = {
      generatedAt: new Date().toISOString(),
      period,
      user: {
        name: userData.name,
        email: userData.email,
        fitnessLevel: userData.fitnessLevel,
        metrics: {
          weight: userData.weight,
          height: userData.height,
          age: userData.age,
          bmi: userData.weight && userData.height 
            ? (userData.weight / ((userData.height/100) ** 2)).toFixed(2)
            : null
        }
      },
      summary: {
        totalWorkouts: workoutData.totalWorkouts || 0,
        totalDuration: workoutData.totalDuration || 0,
        totalCalories: workoutData.totalCalories || 0,
        avgWorkoutsPerWeek: (workoutData.totalWorkouts || 0) / 4,
        goalCompletionRate: goalData.completionRate || 0
      },
      performance: {
        improvements,
        streak: await getStreakData(userId),
        fitnessScore: await calculateFitnessScore(userId)
      },
      recommendations: await generateRecommendations(userId, workoutData, goalData)
    };

    return successResponse(res, report, 'Performance report generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get workout trends
// @route   GET /api/analytics/trends
// @access  Private
const getWorkoutTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    const dateRange = getDateRange(period);

    // Get trends for different metrics
    const trends = await WorkoutLog.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$date' },
            year: { $year: '$date' }
          },
          weekStart: { $min: '$date' },
          weekEnd: { $max: '$date' },
          workoutCount: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgPerceivedExertion: { $avg: '$perceivedExertion' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ]);

    // Calculate trend indicators
    const trendIndicators = {
      workouts: calculateTrend(trends.map(t => t.workoutCount)),
      duration: calculateTrend(trends.map(t => t.totalDuration)),
      calories: calculateTrend(trends.map(t => t.totalCalories))
    };

    return successResponse(res, {
      period,
      trends,
      indicators: trendIndicators
    }, 'Workout trends fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get fitness score
// @route   GET /api/analytics/fitness-score
// @access  Private
const getFitnessScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const score = await calculateFitnessScore(userId);
    
    const scoreBreakdown = await calculateFitnessScoreBreakdown(userId);

    return successResponse(res, {
      score,
      breakdown: scoreBreakdown,
      level: getFitnessLevel(score)
    }, 'Fitness score fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ============ HELPER FUNCTIONS ============

// Get date range based on period
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

// Get workout stats
const getWorkoutStats = async (userId, dateRange) => {
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
        avgDuration: { $avg: '$duration' },
        totalCalories: { $sum: '$totalCaloriesBurned' },
        avgCalories: { $avg: '$totalCaloriesBurned' }
      }
    }
  ]);

  return stats[0] || {
    totalWorkouts: 0,
    totalDuration: 0,
    avgDuration: 0,
    totalCalories: 0,
    avgCalories: 0
  };
};

// Get goal stats
const getGoalStats = async (userId) => {
  const goals = await Goal.find({ user: userId });
  const total = goals.length;
  const completed = goals.filter(g => g.status === 'completed').length;
  
  return {
    total,
    completed,
    completionRate: total > 0 ? (completed / total) * 100 : 0
  };
};

// Get user progress
const getUserProgress = async (userId, dateRange) => {
  const progress = await WorkoutLog.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        workouts: { $sum: 1 },
        duration: { $sum: '$duration' },
        calories: { $sum: '$totalCaloriesBurned' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return progress;
};

// Get calorie stats
const getCalorieStats = async (userId, dateRange) => {
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
        totalCalories: { $sum: '$totalCaloriesBurned' },
        avgCalories: { $avg: '$totalCaloriesBurned' },
        maxCalories: { $max: '$totalCaloriesBurned' },
        minCalories: { $min: '$totalCaloriesBurned' }
      }
    }
  ]);

  return stats[0] || {
    totalCalories: 0,
    avgCalories: 0,
    maxCalories: 0,
    minCalories: 0
  };
};

// Get streak data
const getStreakData = async (userId) => {
  const user = await User.findById(userId);
  return {
    currentStreak: user.streakCount || 0,
    lastWorkoutDate: user.lastWorkoutDate
  };
};

// Get workouts progress
const getWorkoutsProgress = async (userId, dateRange) => {
  const data = await WorkoutLog.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return data.map(item => ({
    date: item._id,
    value: item.count
  }));
};

// Get calories progress
const getCaloriesProgress = async (userId, dateRange) => {
  const data = await WorkoutLog.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        calories: { $sum: '$totalCaloriesBurned' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return data.map(item => ({
    date: item._id,
    value: item.calories
  }));
};

// Get duration progress
const getDurationProgress = async (userId, dateRange) => {
  const data = await WorkoutLog.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        duration: { $sum: '$duration' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return data.map(item => ({
    date: item._id,
    value: item.duration
  }));
};

// Get weight progress
const getWeightProgress = async (userId, dateRange) => {
  // This would require weight tracking - for now return empty array
  // You could add a Weight model to track weight over time
  return [];
};

// Get strength progress
const getStrengthProgress = async (userId, dateRange) => {
  // Track strength metrics - for now return empty array
  return [];
};

// Calculate improvements
const calculateImprovements = async (userId, dateRange) => {
  const midDate = new Date(dateRange.start);
  midDate.setDate(midDate.getDate() + Math.floor((dateRange.end - dateRange.start) / (2 * 24 * 60 * 60 * 1000)));

  const firstHalf = await WorkoutLog.find({
    user: userId,
    date: { $gte: dateRange.start, $lt: midDate }
  });

  const secondHalf = await WorkoutLog.find({
    user: userId,
    date: { $gte: midDate, $lte: dateRange.end }
  });

 const avgDurationFirst = firstHalf.reduce((sum, w) => sum + w.duration, 0) / (firstHalf.length || 1);
  const avgDurationSecond = secondHalf.reduce((sum, w) => sum + w.duration, 0) / (secondHalf.length || 1);
  
  const avgCaloriesFirst = firstHalf.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (firstHalf.length || 1);
  const avgCaloriesSecond = secondHalf.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (secondHalf.length || 1);

  return {
    duration: {
      before: Math.round(avgDurationFirst),
      after: Math.round(avgDurationSecond),
      improvement: Math.round(((avgDurationSecond - avgDurationFirst) / (avgDurationFirst || 1)) * 100)
    },
    calories: {
      before: Math.round(avgCaloriesFirst),
      after: Math.round(avgCaloriesSecond),
      improvement: Math.round(((avgCaloriesSecond - avgCaloriesFirst) / (avgCaloriesFirst || 1)) * 100)
    },
    consistency: {
      firstHalf: firstHalf.length,
      secondHalf: secondHalf.length,
      improvement: Math.round(((secondHalf.length - firstHalf.length) / (firstHalf.length || 1)) * 100)
    }
  };
};

// Calculate fitness score
const calculateFitnessScore = async (userId) => {
  const user = await User.findById(userId);
  const totalWorkouts = user.totalWorkouts || 0;
  const streak = user.streakCount || 0;

  // Get last 30 days of workouts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentWorkouts = await WorkoutLog.find({
    user: userId,
    date: { $gte: thirtyDaysAgo }
  });

  const recentCount = recentWorkouts.length;
  const recentAvgCalories = recentWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (recentCount || 1);

  // Calculate score components (0-100)
  const consistencyScore = Math.min((recentCount / 20) * 100, 100);
  const streakBonus = Math.min(streak * 5, 25);
  const caloriesScore = Math.min((recentAvgCalories / 500) * 100, 100);
  const experienceScore = Math.min((totalWorkouts / 100) * 100, 100);

  // Weighted average
  const score = (consistencyScore * 0.4) + (caloriesScore * 0.3) + (experienceScore * 0.2) + (streakBonus * 0.1);

  return Math.round(Math.min(score, 100));
};

// Calculate fitness score breakdown
const calculateFitnessScoreBreakdown = async (userId) => {
  const user = await User.findById(userId);
  const totalWorkouts = user.totalWorkouts || 0;
  const streak = user.streakCount || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentWorkouts = await WorkoutLog.find({
    user: userId,
    date: { $gte: thirtyDaysAgo }
  });

  const recentCount = recentWorkouts.length;
  const recentAvgCalories = recentWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0) / (recentCount || 1);

  return {
    consistency: Math.min((recentCount / 20) * 100, 100),
    intensity: Math.min((recentAvgCalories / 500) * 100, 100),
    experience: Math.min((totalWorkouts / 100) * 100, 100),
    streak: Math.min(streak * 5, 100)
  };
};

// Get fitness level based on score
const getFitnessLevel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Fair';
  return 'Needs Improvement';
};

// Calculate trend
const calculateTrend = (data) => {
  if (data.length < 2) return 'insufficient-data';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const avgFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
  
  const percentChange = ((avgSecond - avgFirst) / (avgFirst || 1)) * 100;
  
  if (percentChange > 10) return 'improving';
  if (percentChange < -10) return 'declining';
  return 'stable';
};

// Generate recommendations
const generateRecommendations = async (userId, workoutData, goalData) => {
  const recommendations = [];

  if (workoutData.totalWorkouts < 8) {
    recommendations.push({
      type: 'workout-frequency',
      message: 'Try to work out at least 2-3 times per week for consistent progress',
      priority: 'high'
    });
  }

  if (workoutData.avgDuration < 30) {
    recommendations.push({
      type: 'workout-duration',
      message: 'Increase your workout duration to 30-45 minutes for better results',
      priority: 'medium'
    });
  }

  if (goalData.completionRate < 50) {
    recommendations.push({
      type: 'goal-setting',
      message: 'Consider setting smaller, more achievable goals to improve success rate',
      priority: 'high'
    });
  }

  return recommendations;
};

module.exports = {
  getAnalyticsSummary,
  getProgressData,
  getWorkoutAnalytics,
  getGoalAnalytics,
  getCalorieAnalytics,
  getPerformanceReport,
  getWorkoutTrends,
  getFitnessScore
};