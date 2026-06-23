const Joi = require('joi');

/**
 * Dashboard Query Validation
 */
const dashboardQueryValidation = Joi.object({
  period: Joi.string()
    .valid('today', 'week', 'month')
    .optional()
    .default('week')
    .messages({
      'any.only': 'Period must be: today, week, or month'
    })
});

/**
 * Weekly Summary Validation
 */
const weeklySummaryValidation = Joi.object({
  weekStart: Joi.date()
    .optional()
    .messages({
      'date.base': 'Week start must be a valid date'
    }),
  
  weekEnd: Joi.date()
    .min(Joi.ref('weekStart'))
    .optional()
    .messages({
      'date.min': 'Week end must be after week start'
    })
});

module.exports = {
  dashboardQueryValidation,
  weeklySummaryValidation
};