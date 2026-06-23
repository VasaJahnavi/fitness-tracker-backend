/**
 * Calorie Calculator Utility
 * Calculates calories burned during exercises and daily maintenance calories
 */

// MET (Metabolic Equivalent of Task) values for different activities
const MET_VALUES = {
  // Strength Training
  'strength-training-light': 3.0,
  'strength-training-moderate': 4.5,
  'strength-training-heavy': 6.0,
  
  // Cardio
  'cardio-light': 4.0,
  'cardio-moderate': 6.0,
  'cardio-high': 8.0,
  'running': 9.8,
  'walking': 3.5,
  'cycling': 7.5,
  'swimming': 7.0,
  
  // HIIT
  'hiit': 8.5,
  
  // Yoga
  'yoga-light': 2.5,
  'yoga-moderate': 4.0,
  'yoga-intensive': 6.0,
  
  // Flexibility
  'flexibility-light': 2.0,
  'flexibility-moderate': 3.0,
  
  // Default
  'default': 3.0
};

/**
 * Calculate calories burned during exercise
 * @param {string} exerciseType - Type of exercise
 * @param {number} duration - Duration in minutes
 * @param {number} weight - User weight in kg
 * @param {string} intensity - Intensity level (light, moderate, high)
 * @returns {number} - Calories burned
 */
const calculateCaloriesBurned = (exerciseType, duration, weight, intensity = 'moderate') => {
  if (!duration || !weight) return 0;
  
  // Get MET value based on exercise type and intensity
  let metKey = exerciseType;
  if (intensity) {
    metKey = `${exerciseType}-${intensity}`;
  }
  
  const met = MET_VALUES[metKey] || MET_VALUES['default'];
  
  // Formula: Calories = MET × weight(kg) × duration(hours)
  const durationInHours = duration / 60;
  const calories = met * weight * durationInHours;
  
  return Math.round(calories * 100) / 100;
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} - BMR calories per day
 */
const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age || !gender) return 0;
  
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return Math.round(bmr);
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level (sedentary, light, moderate, active, very-active)
 * @returns {number} - TDEE calories per day
 */
const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr) return 0;
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate calories burned for a specific exercise
 * @param {object} exercise - Exercise object with type, duration, intensity
 * @param {number} weight - User weight in kg
 * @returns {number} - Calories burned
 */
const calculateExerciseCalories = (exercise, weight) => {
  const { type, duration, intensity = 'moderate' } = exercise;
  return calculateCaloriesBurned(type, duration, weight, intensity);
};

/**
 * Calculate total calories burned in a workout session
 * @param {array} exercises - Array of exercise objects
 * @param {number} weight - User weight in kg
 * @returns {object} - Total calories and breakdown
 */
const calculateWorkoutCalories = (exercises, weight) => {
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return { total: 0, breakdown: [] };
  }
  
  const breakdown = exercises.map(exercise => ({
    exercise: exercise.name || exercise.type,
    duration: exercise.duration || 0,
    calories: calculateExerciseCalories(exercise, weight)
  }));
  
  const total = breakdown.reduce((sum, item) => sum + item.calories, 0);
  
  return {
    total: Math.round(total * 100) / 100,
    breakdown
  };
};

/**
 * Calculate daily calorie needs based on goals
 * @param {object} user - User object with weight, height, age, gender, goal
 * @param {string} activityLevel - Activity level
 * @returns {object} - Calorie recommendations
 */
const calculateDailyCalorieNeeds = (user, activityLevel) => {
  const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  let recommendation = {
    bmr,
    tdee,
    maintenance: tdee,
    weightLoss: Math.round(tdee - 500),
    weightGain: Math.round(tdee + 500)
  };
  
  // Adjust based on user's fitness goal
  if (user.fitnessGoals && user.fitnessGoals.includes('lose-weight')) {
    recommendation.recommended = recommendation.weightLoss;
    recommendation.goal = 'Weight Loss';
  } else if (user.fitnessGoals && user.fitnessGoals.includes('gain-muscle')) {
    recommendation.recommended = recommendation.weightGain;
    recommendation.goal = 'Muscle Gain';
  } else {
    recommendation.recommended = recommendation.maintenance;
    recommendation.goal = 'Maintenance';
  }
  
  return recommendation;
};

/**
 * Estimate calories burned per minute for an exercise
 * @param {string} exerciseType - Type of exercise
 * @param {number} weight - User weight in kg
 * @param {string} intensity - Intensity level
 * @returns {number} - Calories per minute
 */
const getCaloriesPerMinute = (exerciseType, weight, intensity = 'moderate') => {
  const metKey = `${exerciseType}-${intensity}`;
  const met = MET_VALUES[metKey] || MET_VALUES['default'];
  
  // Calories per minute = MET × weight(kg) / 60
  return Math.round((met * weight / 60) * 100) / 100;
};

module.exports = {
  calculateCaloriesBurned,
  calculateBMR,
  calculateTDEE,
  calculateExerciseCalories,
  calculateWorkoutCalories,
  calculateDailyCalorieNeeds,
  getCaloriesPerMinute,
  MET_VALUES
};