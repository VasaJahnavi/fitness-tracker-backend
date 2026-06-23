const Joi = require('joi');

/**
 * Create Exercise Validation
 */
const createExerciseValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Exercise name must be a string',
      'string.empty': 'Exercise name is required',
      'string.min': 'Exercise name must be at least 2 characters',
      'string.max': 'Exercise name cannot exceed 100 characters',
      'any.required': 'Exercise name is required'
    }),
  
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .required()
    .messages({
      'any.only': 'Category must be: strength-training, cardio, yoga, hiit, or flexibility',
      'any.required': 'Category is required'
    }),
  
  muscleGroup: Joi.array()
    .items(
      Joi.string().valid(
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 
        'legs', 'glutes', 'core', 'cardio', 'full-body'
      )
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one muscle group is required',
      'array.items': 'Invalid muscle group',
      'any.required': 'Muscle group is required'
    }),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
    .default('intermediate')
    .messages({
      'any.only': 'Difficulty level must be: beginner, intermediate, or advanced'
    }),
  
  caloriesPerMinute: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Calories per minute cannot be negative',
      'any.required': 'Calories per minute is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  instructions: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.items': 'Instructions must be strings'
    }),
  
  equipmentNeeded: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.items': 'Equipment must be strings'
    }),
  
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    }),
  
  videoUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Video URL must be a valid URL'
    })
});

/**
 * Update Exercise Validation
 */
const updateExerciseValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Exercise name must be at least 2 characters',
      'string.max': 'Exercise name cannot exceed 100 characters'
    }),
  
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .optional(),
  
  muscleGroup: Joi.array()
    .items(
      Joi.string().valid(
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 
        'legs', 'glutes', 'core', 'cardio', 'full-body'
      )
    )
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one muscle group is required',
      'array.items': 'Invalid muscle group'
    }),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  
  caloriesPerMinute: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Calories per minute cannot be negative'
    }),
  
  description: Joi.string()
    .max(500)
    .optional(),
  
  instructions: Joi.array()
    .items(Joi.string())
    .optional(),
  
  equipmentNeeded: Joi.array()
    .items(Joi.string())
    .optional(),
  
  imageUrl: Joi.string()
    .uri()
    .optional(),
  
  videoUrl: Joi.string()
    .uri()
    .optional(),
  
  isActive: Joi.boolean()
    .optional()
});

/**
 * Exercise Search Validation
 */
const exerciseSearchValidation = Joi.object({
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .optional(),
  
  muscleGroup: Joi.string()
    .valid(
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 
      'legs', 'glutes', 'core', 'cardio', 'full-body'
    )
    .optional(),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  
  search: Joi.string()
    .optional(),
  
  page: Joi.number()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

module.exports = {
  createExerciseValidation,
  updateExerciseValidation,
  exerciseSearchValidation
};