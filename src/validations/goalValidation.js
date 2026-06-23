const Joi = require('joi');

/**
 * Create Goal Validation
 */
const createGoalValidation = Joi.object({
  type: Joi.string()
    .valid('weight-loss', 'weight-gain', 'daily-exercise', 'weekly-workout', 'strength', 'cardio')
    .required()
    .messages({
      'any.only': 'Goal type must be: weight-loss, weight-gain, daily-exercise, weekly-workout, strength, or cardio',
      'any.required': 'Goal type is required'
    }),
  
  targetValue: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Target value must be a number',
      'number.min': 'Target value cannot be negative',
      'any.required': 'Target value is required'
    }),
  
  targetUnit: Joi.string()
    .valid('kg', 'lbs', 'minutes', 'hours', 'sessions', 'reps')
    .required()
    .messages({
      'any.only': 'Target unit must be: kg, lbs, minutes, hours, sessions, or reps',
      'any.required': 'Target unit is required'
    }),
  
  targetDate: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.base': 'Target date must be a valid date',
      'date.greater': 'Target date must be in the future',
      'any.required': 'Target date is required'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

/**
 * Update Goal Validation
 */
const updateGoalValidation = Joi.object({
  type: Joi.string()
    .valid('weight-loss', 'weight-gain', 'daily-exercise', 'weekly-workout', 'strength', 'cardio')
    .optional(),
  
  targetValue: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Target value cannot be negative'
    }),
  
  targetUnit: Joi.string()
    .valid('kg', 'lbs', 'minutes', 'hours', 'sessions', 'reps')
    .optional(),
  
  targetDate: Joi.date()
    .greater('now')
    .optional()
    .messages({
      'date.greater': 'Target date must be in the future'
    }),
  
  status: Joi.string()
    .valid('active', 'completed', 'failed', 'paused')
    .optional()
    .messages({
      'any.only': 'Status must be: active, completed, failed, or paused'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
});

/**
 * Update Goal Progress Validation
 */
const updateGoalProgressValidation = Joi.object({
  currentValue: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Current value must be a number',
      'number.min': 'Current value cannot be negative',
      'any.required': 'Current value is required'
    })
});

/**
 * Goal Filter Validation
 */
const goalFilterValidation = Joi.object({
  status: Joi.string()
    .valid('active', 'completed', 'failed', 'paused')
    .optional(),
  
  type: Joi.string()
    .valid('weight-loss', 'weight-gain', 'daily-exercise', 'weekly-workout', 'strength', 'cardio')
    .optional(),
  
  page: Joi.number()
    .min(1)
    .optional()
    .default(1),
  
  limit: Joi.number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
});

module.exports = {
  createGoalValidation,
  updateGoalValidation,
  updateGoalProgressValidation,
  goalFilterValidation
};