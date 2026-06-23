const { errorResponse } = require('../utils/apiResponse');

/**
 * Validate request against Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return errorResponse(res, 'Validation error', 400, errors);
    }

    next();
  };
};

/**
 * Validate query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return errorResponse(res, 'Validation error', 400, errors);
    }

    next();
  };
};

/**
 * Validate request parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return errorResponse(res, 'Validation error', 400, errors);
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams
};