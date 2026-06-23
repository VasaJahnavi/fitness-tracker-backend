/**
 * Validations Index File
 * Exports all validation schemas for the Fitness & Workout Tracking App
 */

// ============ AUTH VALIDATIONS ============
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updateMetricsValidation,
  updatePreferencesValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('./authValidation');

// ============ USER VALIDATIONS ============
const {
  userProfileValidation,
  userMetricsValidation,
  userPreferencesValidation,
  userSettingsValidation,
  userIdValidation,
  userSearchValidation,
  userStatsValidation,
  bulkUserUpdateValidation,
  userDeletionValidation,
  userEmailUpdateValidation,
  userNotificationPreferencesValidation
} = require('./userValidation');

// ============ EXERCISE VALIDATIONS ============
const {
  createExerciseValidation,
  updateExerciseValidation,
  exerciseSearchValidation
} = require('./exerciseValidation');

// ============ WORKOUT VALIDATIONS ============
const {
  createWorkoutValidation,
  updateWorkoutValidation,
  addExerciseToWorkoutValidation,
  logWorkoutValidation,
  workoutSearchValidation
} = require('./workoutValidation');

// ============ GOAL VALIDATIONS ============
const {
  createGoalValidation,
  updateGoalValidation,
  updateGoalProgressValidation,
  goalFilterValidation
} = require('./goalValidation');

// ============ ACTIVITY VALIDATIONS ============
const {
  logActivityValidation,
  updateActivityValidation,
  activityFilterValidation
} = require('./activityValidation');

// ============ ANALYTICS VALIDATIONS ============
const {
  analyticsQueryValidation,
  progressDataValidation,
  reportValidation
} = require('./analyticsValidation');

// ============ DASHBOARD VALIDATIONS ============
const {
  dashboardQueryValidation,
  weeklySummaryValidation
} = require('./dashboardValidation');

// ============ RECOMMENDATION VALIDATIONS ============
const {
  recommendationQueryValidation,
  recommendationActionValidation
} = require('./recommendationValidation');

// ============ EXPORT ALL VALIDATIONS ============
module.exports = {
  // Auth Validations
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updateMetricsValidation,
  updatePreferencesValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,

  // User Validations
  userProfileValidation,
  userMetricsValidation,
  userPreferencesValidation,
  userSettingsValidation,
  userIdValidation,
  userSearchValidation,
  userStatsValidation,
  bulkUserUpdateValidation,
  userDeletionValidation,
  userEmailUpdateValidation,
  userNotificationPreferencesValidation,

  // Exercise Validations
  createExerciseValidation,
  updateExerciseValidation,
  exerciseSearchValidation,

  // Workout Validations
  createWorkoutValidation,
  updateWorkoutValidation,
  addExerciseToWorkoutValidation,
  logWorkoutValidation,
  workoutSearchValidation,

  // Goal Validations
  createGoalValidation,
  updateGoalValidation,
  updateGoalProgressValidation,
  goalFilterValidation,

  // Activity Validations
  logActivityValidation,
  updateActivityValidation,
  activityFilterValidation,

  // Analytics Validations
  analyticsQueryValidation,
  progressDataValidation,
  reportValidation,

  // Dashboard Validations
  dashboardQueryValidation,
  weeklySummaryValidation,

  // Recommendation Validations
  recommendationQueryValidation,
  recommendationActionValidation
};