/**
 * Recommendation Engine
 * Generates personalized workout recommendations based on user data
 */

const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');

/**
 * Get user's fitness profile
 * @param {object} user - User object
 * @returns {object} - User fitness profile
 */
const getUserFitnessProfile = async (user) => {
  const logs = await WorkoutLog.find({ user: user._id })
    .sort({ date: -1 })
    .limit(30);

  const recentWorkouts = logs.map(log => ({
    exercises: log.exercises,
    duration: log.duration,
    totalCalories: log.totalCaloriesBurned,
    date: log.date
  }));

  // Calculate average workout metrics
  const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length || 0;
  const avgCalories = logs.reduce((sum, log) => sum + log.totalCaloriesBurned, 0) / logs.length || 0;
  const totalWorkouts = logs.length;

  // Determine preferred workout types
  const typeFrequency = {};
  logs.forEach(log => {
    log.exercises.forEach(exercise => {
      const type = exercise.category || 'unknown';
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });
  });

  const preferredTypes = Object.entries(typeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  return {
    fitnessLevel: user.fitnessLevel || 'beginner',
    goals: user.fitnessGoals || [],
    preferences: user.preferences || {},
    metrics: {
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender
    },
    workoutHistory: {
      totalWorkouts,
      avgDuration: Math.round(avgDuration),
      avgCalories: Math.round(avgCalories),
      preferredTypes,
      lastWorkoutDate: logs.length > 0 ? logs[0].date : null
    }
  };
};

/**
 * Generate workout recommendations based on user profile
 * @param {object} user - User object
 * @param {number} limit - Number of recommendations
 * @returns {array} - Array of workout recommendations
 */
const generateWorkoutRecommendations = async (user, limit = 5) => {
  const profile = await getUserFitnessProfile(user);

  // Build query based on user profile
  const query = { isPublic: true };
  
  // Match difficulty level
  if (profile.fitnessLevel) {
    query.difficultyLevel = profile.fitnessLevel;
  }

  // Match preferred workout types
  if (profile.workoutHistory.preferredTypes && profile.workoutHistory.preferredTypes.length > 0) {
    query.category = { $in: profile.workoutHistory.preferredTypes };
  }

  // Match user goals
  if (profile.goals && profile.goals.length > 0) {
    const goalCategories = {
      'lose-weight': ['cardio', 'hiit'],
      'gain-muscle': ['strength-training'],
      'improve-cardio': ['cardio', 'hiit'],
      'increase-strength': ['strength-training'],
      'flexibility': ['yoga', 'flexibility']
    };

    const categories = profile.goals.flatMap(goal => goalCategories[goal] || []);
    if (categories.length > 0) {
      query.category = { $in: categories };
    }
  }

  // Get recommendations
  let recommendations = await WorkoutPlan.find(query)
    .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute')
    .limit(limit)
    .sort({ createdAt: -1 });

  // If not enough recommendations, get more from different categories
  if (recommendations.length < limit) {
    const additionalQuery = { isPublic: true, _id: { $nin: recommendations.map(r => r._id) } };
    const additional = await WorkoutPlan.find(additionalQuery)
      .populate('exercises.exerciseId', 'name category muscleGroup caloriesPerMinute')
      .limit(limit - recommendations.length)
      .sort({ totalCalories: -1 });
    
    recommendations = [...recommendations, ...additional];
  }

  // Score and rank recommendations
  const scoredRecommendations = recommendations.map(workout => {
    let score = 0;

    // Score based on fitness level match
    if (workout.difficultyLevel === profile.fitnessLevel) score += 30;

    // Score based on preferred types
    if (profile.workoutHistory.preferredTypes.includes(workout.category)) {
      score += 20;
    }

    // Score based on goals
    const goalCategories = {
      'lose-weight': ['cardio', 'hiit'],
      'gain-muscle': ['strength-training'],
      'improve-cardio': ['cardio', 'hiit'],
      'increase-strength': ['strength-training'],
      'flexibility': ['yoga', 'flexibility']
    };

    profile.goals.forEach(goal => {
      if (goalCategories[goal] && goalCategories[goal].includes(workout.category)) {
        score += 20;
      }
    });

    // Score based on duration (prefer workouts matching user's average duration)
    if (profile.workoutHistory.avgDuration > 0) {
      const durationDiff = Math.abs(workout.duration - profile.workoutHistory.avgDuration);
      if (durationDiff < 10) score += 10;
      else if (durationDiff < 20) score += 5;
    }

    return {
      workout,
      score,
      reason: getRecommendationReason(workout, profile)
    };
  });

  // Sort by score and return
  return scoredRecommendations
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      workout: item.workout,
      reason: item.reason,
      confidenceScore: Math.min(item.score / 100, 1)
    }));
};

/**
 * Generate exercise recommendations
 * @param {object} user - User object
 * @param {number} limit - Number of recommendations
 * @returns {array} - Array of exercise recommendations
 */
const generateExerciseRecommendations = async (user, limit = 5) => {
  const profile = await getUserFitnessProfile(user);

  // Build query based on user profile
  const query = { isActive: true };
  
  if (profile.fitnessLevel) {
    query.difficultyLevel = profile.fitnessLevel;
  }

  // Get user's recent exercises
  const recentExercises = await WorkoutLog.find({ user: user._id })
    .sort({ date: -1 })
    .limit(20)
    .select('exercises.exerciseId');

  const recentExerciseIds = recentExercises.flatMap(log => 
    log.exercises.map(ex => ex.exerciseId.toString())
  );

  // Exclude recently done exercises
  if (recentExerciseIds.length > 0) {
    query._id = { $nin: recentExerciseIds };
  }

  let exercises = await Exercise.find(query)
    .limit(limit)
    .sort({ createdAt: -1 });

  // If not enough, get some from popular categories
  if (exercises.length < limit) {
    const additionalQuery = { isActive: true, _id: { $nin: exercises.map(e => e._id) } };
    const additional = await Exercise.find(additionalQuery)
      .limit(limit - exercises.length)
      .sort({ caloriesPerMinute: -1 });
    
    exercises = [...exercises, ...additional];
  }

  // Score exercises
  const scoredExercises = exercises.map(exercise => {
    let score = 0;

    // Score based on fitness level
    if (exercise.difficultyLevel === profile.fitnessLevel) score += 30;
    else if (exercise.difficultyLevel === 'beginner' && profile.fitnessLevel === 'beginner') score += 30;

    // Score based on goals
    const goalMuscleGroups = {
      'gain-muscle': ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps'],
      'increase-strength': ['chest', 'back', 'legs'],
      'improve-cardio': ['cardio'],
      'flexibility': ['core', 'full-body']
    };

    profile.goals.forEach(goal => {
      if (goalMuscleGroups[goal] && exercise.muscleGroup.some(mg => goalMuscleGroups[goal].includes(mg))) {
        score += 20;
      }
    });

    // Score based on calorie burn
    if (exercise.caloriesPerMinute > 5) score += 10;
    else if (exercise.caloriesPerMinute > 3) score += 5;

    return {
      exercise,
      score,
      reason: getExerciseReason(exercise, profile)
    };
  });

  return scoredExercises
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      exercise: item.exercise,
      reason: item.reason,
      confidenceScore: Math.min(item.score / 100, 1)
    }));
};

/**
 * Generate daily activity recommendations
 * @param {object} user - User object
 * @returns {object} - Daily activity recommendation
 */
const generateDailyActivityRecommendation = async (user) => {
  const profile = await getUserFitnessProfile(user);
  
  // Check if user worked out today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayWorkout = await WorkoutLog.findOne({
    user: user._id,
    date: { $gte: today }
  });

  let recommendation = {
    type: 'daily-activity',
    message: '',
    activities: [],
    isRestDay: false
  };

  // If user worked out today
  if (todayWorkout) {
    recommendation.message = 'Great job! You\'ve already worked out today. Consider light stretching or walking for active recovery.';
    recommendation.activities = [
      'Light stretching - 10 minutes',
      'Walking - 15 minutes',
      'Hydration - 2L water'
    ];
    recommendation.isRestDay = false;
  } else {
    // Check if user needs rest
    const lastWorkouts = await WorkoutLog.find({ user: user._id })
      .sort({ date: -1 })
      .limit(3);

    if (lastWorkouts.length === 3) {
      const consecutiveDays = checkConsecutiveWorkoutDays(lastWorkouts);
      if (consecutiveDays >= 3) {
        recommendation.isRestDay = true;
        recommendation.message = 'You\'ve worked out for 3 consecutive days. Today is a good day for rest and recovery.';
        recommendation.activities = [
          'Rest and recovery',
          'Gentle stretching',
          'Hydration - 2.5L water',
          'Quality sleep - 8 hours'
        ];
        return recommendation;
      }
    }

    // Generate workout recommendation for today
    const workoutRecommendations = await generateWorkoutRecommendations(user, 1);
    
    if (workoutRecommendations.length > 0) {
      const recommendedWorkout = workoutRecommendations[0];
      recommendation.message = `We recommend: ${recommendedWorkout.workout.name}`;
      recommendation.activities = [
        `Workout: ${recommendedWorkout.workout.name}`,
        `Duration: ${recommendedWorkout.workout.duration} minutes`,
        `Category: ${recommendedWorkout.workout.category}`,
        `Estimated calories: ${recommendedWorkout.workout.totalCalories}`
      ];
      recommendation.recommendedWorkout = recommendedWorkout.workout;
    } else {
      recommendation.message = 'Time for a workout! Here are some activities you can do today.';
      recommendation.activities = [
        'Cardio - 20 minutes',
        'Strength training - 15 minutes',
        'Stretching - 10 minutes'
      ];
    }
  }

  return recommendation;
};

/**
 * Check consecutive workout days
 * @param {array} workouts - Array of workout logs
 * @returns {number} - Number of consecutive days
 */
const checkConsecutiveWorkoutDays = (workouts) => {
  if (!workouts || workouts.length === 0) return 0;
  
  let consecutive = 1;
  for (let i = 0; i < workouts.length - 1; i++) {
    const currentDate = new Date(workouts[i].date);
    const nextDate = new Date(workouts[i + 1].date);
    
    const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      consecutive++;
    } else {
      break;
    }
  }
  
  return consecutive;
};

/**
 * Get recommendation reason
 * @param {object} workout - Workout plan
 * @param {object} profile - User profile
 * @returns {string} - Reason for recommendation
 */
const getRecommendationReason = (workout, profile) => {
  const reasons = [];
  
  if (profile.fitnessLevel === workout.difficultyLevel) {
    reasons.push(`Matches your ${profile.fitnessLevel} fitness level`);
  }
  
  if (profile.workoutHistory.preferredTypes.includes(workout.category)) {
    reasons.push(`You enjoy ${workout.category} workouts`);
  }
  
  if (profile.goals && profile.goals.length > 0) {
    const goalMap = {
      'lose-weight': 'weight loss',
      'gain-muscle': 'muscle gain',
      'improve-cardio': 'cardiovascular improvement',
      'increase-strength': 'strength building',
      'flexibility': 'flexibility improvement'
    };
    
    profile.goals.forEach(goal => {
      if (goalMap[goal]) {
        reasons.push(`Supports your ${goalMap[goal]} goal`);
      }
    });
  }
  
  return reasons.join('. ') || 'Based on your fitness profile';
};

/**
 * Get exercise reason
 * @param {object} exercise - Exercise
 * @param {object} profile - User profile
 * @returns {string} - Reason for recommendation
 */
const getExerciseReason = (exercise, profile) => {
  const reasons = [];
  
  if (profile.fitnessLevel === exercise.difficultyLevel) {
    reasons.push(`Matches your ${profile.fitnessLevel} fitness level`);
  }
  
  if (exercise.caloriesPerMinute > 5) {
    reasons.push('High calorie burn rate');
  }
  
  return reasons.join('. ') || 'Based on your fitness profile';
};

module.exports = {
  getUserFitnessProfile,
  generateWorkoutRecommendations,
  generateExerciseRecommendations,
  generateDailyActivityRecommendation,
  checkConsecutiveWorkoutDays
};