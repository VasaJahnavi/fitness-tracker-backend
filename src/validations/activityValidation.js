const Joi = require('joi');

/**
 * Log Activity Validation
 */
const logActivityValidation = Joi.object({
  workoutPlanId: Joi.string()
    .optional(),
  
  date: Joi.date()
    .optional()
    .default(() => new Date()),
  
  duration: Joi.number()
    .min(1)
    .max(300)
    .required()
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 300 minutes',
      'any.required': 'Duration is required'
    }),
  
  exercises: Joi.array()
    .items(
      Joi.object({
        exerciseId: Joi.string()
          .required()
          .messages({
            'any.required': 'Exercise ID is required'
          }),
        
        sets: Joi.number()
          .min(1)
          .optional(),
        
        reps: Joi.number()
          .min(1)
          .optional(),
        
        weight: Joi.number()
          .min(0)
          .optional(),
        
        duration: Joi.number()
          .min(1)
          .optional(),
        
        caloriesBurned: Joi.number()
          .min(0)
          .optional(),
        
        notes: Joi.string()
          .max(200)
          .optional()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one exercise is required',
      'any.required': 'Exercises are required'
    }),
  
  perceivedExertion: Joi.number()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'number.min': 'Perceived exertion must be between 1 and 10',
      'number.max': 'Perceived exertion must be between 1 and 10'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional(),
  
  mood: Joi.string()
    .valid('great', 'good', 'okay', 'tired', 'exhausted')
    .optional()
});

/**
 * Update Activity Validation
 */
const updateActivityValidation = Joi.object({
  date: Joi.date()
    .optional(),
  
  duration: Joi.number()
    .min(1)
    .max(300)
    .optional(),
  
  exercises: Joi.array()
    .items(
      Joi.object({
        exerciseId: Joi.string()
          .required(),
        
        sets: Joi.number()
          .min(1)
          .optional(),
        
        reps: Joi.number()
          .min(1)
          .optional(),
        
        weight: Joi.number()
          .min(0)
          .optional(),
        
        duration: Joi.number()
          .min(1)
          .optional(),
        
        caloriesBurned: Joi.number()
          .min(0)
          .optional(),
        
        notes: Joi.string()
          .max(200)
          .optional()
      })
    )
    .min(1)
    .optional(),
  
  perceivedExertion: Joi.number()
    .min(1)
    .max(10)
    .optional(),
  
  notes: Joi.string()
    .max(500)
    .optional(),
  
  mood: Joi.string()
    .valid('great', 'good', 'okay', 'tired', 'exhausted')
    .optional()
});

/**
 * Activity Filter Validation
 */
const activityFilterValidation = Joi.object({
  startDate: Joi.date()
    .optional(),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.min': 'End date must be after start date'
    }),
  
  page: Joi.number()
    .min(1)
    .optional()
    .default(1),
  
  limit: Joi.number()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  
  sortBy: Joi.string()
    .valid('date', 'duration', 'totalCaloriesBurned', 'perceivedExertion')
    .optional()
    .default('date'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  logActivityValidation,
  updateActivityValidation,
  activityFilterValidation
};