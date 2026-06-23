const Joi = require('joi');

/**
 * User Registration Validation
 */
const registerValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  
  age: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say')
    .optional()
    .messages({
      'any.only': 'Gender must be one of: male, female, other, prefer-not-to-say'
    }),
  
  height: Joi.number()
    .min(50)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Height must be at least 50 cm',
      'number.max': 'Height cannot exceed 300 cm'
    }),
  
  weight: Joi.number()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'number.min': 'Weight must be at least 10 kg',
      'number.max': 'Weight cannot exceed 500 kg'
    }),
  
  fitnessLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
    .messages({
      'any.only': 'Fitness level must be: beginner, intermediate, or advanced'
    })
});

/**
 * User Login Validation
 */
const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

/**
 * Update Profile Validation
 */
const updateProfileValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  age: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say')
    .optional(),
  
  height: Joi.number()
    .min(50)
    .max(300)
    .optional(),
  
  weight: Joi.number()
    .min(10)
    .max(500)
    .optional(),
  
  fitnessLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  
  fitnessGoals: Joi.array()
    .items(
      Joi.string().valid(
        'lose-weight', 
        'gain-muscle', 
        'improve-cardio', 
        'increase-strength', 
        'flexibility'
      )
    )
    .optional()
    .messages({
      'array.items': 'Invalid fitness goal'
    })
});

/**
 * Update Metrics Validation
 */
const updateMetricsValidation = Joi.object({
  height: Joi.number()
    .min(50)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Height must be at least 50 cm',
      'number.max': 'Height cannot exceed 300 cm'
    }),
  
  weight: Joi.number()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'number.min': 'Weight must be at least 10 kg',
      'number.max': 'Weight cannot exceed 500 kg'
    }),
  
  age: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    })
});

/**
 * Update Preferences Validation
 */
const updatePreferencesValidation = Joi.object({
  preferredWorkoutDays: Joi.array()
    .items(Joi.number().min(0).max(6))
    .optional()
    .messages({
      'number.min': 'Day must be between 0 (Sunday) and 6 (Saturday)',
      'number.max': 'Day must be between 0 (Sunday) and 6 (Saturday)'
    }),
  
  preferredWorkoutTime: Joi.string()
    .valid('morning', 'afternoon', 'evening', 'night')
    .optional()
    .messages({
      'any.only': 'Workout time must be: morning, afternoon, evening, or night'
    }),
  
  preferredWorkoutTypes: Joi.array()
    .items(
      Joi.string().valid(
        'strength-training', 
        'cardio', 
        'yoga', 
        'hiit', 
        'flexibility'
      )
    )
    .optional()
    .messages({
      'array.items': 'Invalid workout type'
    })
});

/**
 * Change Password Validation
 */
const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.empty': 'New password is required',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
      'any.required': 'Password confirmation is required'
    })
});

/**
 * Forgot Password Validation
 */
const forgotPasswordValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    })
});

/**
 * Reset Password Validation
 */
const resetPasswordValidation = Joi.object({
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
      'any.required': 'Password confirmation is required'
    })
});

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updateMetricsValidation,
  updatePreferencesValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};