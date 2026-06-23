const Joi = require('joi');

/**
 * Analytics Query Validation
 */
const analyticsQueryValidation = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year')
    .optional()
    .default('month')
    .messages({
      'any.only': 'Period must be: week, month, quarter, or year'
    }),
  
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    })
});

/**
 * Progress Data Validation
 */
const progressDataValidation = Joi.object({
  metric: Joi.string()
    .valid('workouts', 'calories', 'duration', 'weight', 'strength')
    .optional()
    .default('workouts')
    .messages({
      'any.only': 'Metric must be: workouts, calories, duration, weight, or strength'
    }),
  
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year')
    .optional()
    .default('month'),
  
  startDate: Joi.date()
    .optional(),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional()
});

/**
 * Report Generation Validation
 */
const reportValidation = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year')
    .optional()
    .default('month'),
  
  format: Joi.string()
    .valid('json', 'pdf')
    .optional()
    .default('json')
    .messages({
      'any.only': 'Format must be: json or pdf'
    }),
  
  include: Joi.array()
    .items(
      Joi.string().valid(
        'workouts', 
        'calories', 
        'goals', 
        'progress', 
        'recommendations'
      )
    )
    .optional()
    .default(['workouts', 'calories', 'goals', 'progress'])
});

module.exports = {
  analyticsQueryValidation,
  progressDataValidation,
  reportValidation
};