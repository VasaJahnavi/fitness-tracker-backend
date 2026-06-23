const Joi = require('joi');

/**
 * Recommendation Query Validation
 */
const recommendationQueryValidation = Joi.object({
  type: Joi.string()
    .valid('workout-plan', 'exercise', 'daily-activity')
    .optional()
    .messages({
      'any.only': 'Type must be: workout-plan, exercise, or daily-activity'
    }),
  
  limit: Joi.number()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 20'
    }),
  
  page: Joi.number()
    .min(1)
    .optional()
    .default(1)
});

/**
 * Recommendation Action Validation
 */
const recommendationActionValidation = Joi.object({
  action: Joi.string()
    .valid('accept', 'reject', 'complete')
    .required()
    .messages({
      'any.only': 'Action must be: accept, reject, or complete',
      'any.required': 'Action is required'
    })
});

module.exports = {
  recommendationQueryValidation,
  recommendationActionValidation
};