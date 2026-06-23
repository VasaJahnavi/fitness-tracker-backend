const Joi = require('joi');

/**
 * Create Workout Plan Validation
 */
const createWorkoutValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Workout name must be a string',
      'string.empty': 'Workout name is required',
      'string.min': 'Workout name must be at least 3 characters',
      'string.max': 'Workout name cannot exceed 100 characters',
      'any.required': 'Workout name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .required()
    .messages({
      'any.only': 'Category must be: strength-training, cardio, yoga, hiit, or flexibility',
      'any.required': 'Category is required'
    }),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
    .default('intermediate')
    .messages({
      'any.only': 'Difficulty level must be: beginner, intermediate, or advanced'
    }),
  
  duration: Joi.number()
    .min(1)
    .max(300)
    .required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 300 minutes (5 hours)',
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
          .optional()
          .default(3)
          .messages({
            'number.min': 'Sets must be at least 1'
          }),
        
        reps: Joi.number()
          .min(1)
          .optional()
          .default(10)
          .messages({
            'number.min': 'Reps must be at least 1'
          }),
        
        duration: Joi.number()
          .min(1)
          .optional()
          .messages({
            'number.min': 'Duration must be at least 1 minute'
          }),
        
        restTime: Joi.number()
          .min(0)
          .optional()
          .default(60)
          .messages({
            'number.min': 'Rest time cannot be negative'
          }),
        
        order: Joi.number()
          .min(0)
          .optional()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one exercise is required',
      'any.required': 'Exercises are required'
    }),
  
  tags: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.items': 'Tags must be strings'
    }),
  
  isPublic: Joi.boolean()
    .optional()
    .default(false)
});

/**
 * Update Workout Plan Validation
 */
const updateWorkoutValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Workout name must be at least 3 characters',
      'string.max': 'Workout name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .max(500)
    .optional(),
  
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .optional(),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  
  duration: Joi.number()
    .min(1)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 300 minutes'
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
        
        duration: Joi.number()
          .min(1)
          .optional(),
        
        restTime: Joi.number()
          .min(0)
          .optional(),
        
        order: Joi.number()
          .min(0)
          .optional()
      })
    )
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one exercise is required'
    }),
  
  tags: Joi.array()
    .items(Joi.string())
    .optional(),
  
  isPublic: Joi.boolean()
    .optional()
});

/**
 * Add Exercise to Workout Validation
 */
const addExerciseToWorkoutValidation = Joi.object({
  exerciseId: Joi.string()
    .required()
    .messages({
      'any.required': 'Exercise ID is required'
    }),
  
  sets: Joi.number()
    .min(1)
    .optional()
    .default(3)
    .messages({
      'number.min': 'Sets must be at least 1'
    }),
  
  reps: Joi.number()
    .min(1)
    .optional()
    .default(10)
    .messages({
      'number.min': 'Reps must be at least 1'
    }),
  
  duration: Joi.number()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Duration must be at least 1 minute'
    }),
  
  restTime: Joi.number()
    .min(0)
    .optional()
    .default(60)
    .messages({
      'number.min': 'Rest time cannot be negative'
    }),
  
  order: Joi.number()
    .min(0)
    .optional()
});

/**
 * Log Workout Validation
 */
const logWorkoutValidation = Joi.object({
  workoutPlanId: Joi.string()
    .optional(),
  
  date: Joi.date()
    .optional()
    .default(() => new Date())
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  
  duration: Joi.number()
    .min(1)
    .max(300)
    .required()
    .messages({
      'number.base': 'Duration must be a number',
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
          .optional()
          .messages({
            'number.min': 'Weight cannot be negative'
          }),
        
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
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  mood: Joi.string()
    .valid('great', 'good', 'okay', 'tired', 'exhausted')
    .optional()
    .messages({
      'any.only': 'Mood must be: great, good, okay, tired, or exhausted'
    })
});

/**
 * Workout Search Validation
 */
const workoutSearchValidation = Joi.object({
  category: Joi.string()
    .valid('strength-training', 'cardio', 'yoga', 'hiit', 'flexibility')
    .optional(),
  
  difficultyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  
  search: Joi.string()
    .optional(),
  
  isPublic: Joi.boolean()
    .optional(),
  
  createdBy: Joi.string()
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
  createWorkoutValidation,
  updateWorkoutValidation,
  addExerciseToWorkoutValidation,
  logWorkoutValidation,
  workoutSearchValidation
};