const Joi = require('joi');

/**
 * User Profile Validation
 * Validates user profile update requests
 */
const userProfileValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  age: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.base': 'Age must be a number',
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say')
    .optional()
    .messages({
      'any.only': 'Gender must be: male, female, other, or prefer-not-to-say'
    }),
  
  height: Joi.number()
    .min(50)
    .max(300)
    .optional()
    .messages({
      'number.base': 'Height must be a number',
      'number.min': 'Height must be at least 50 cm',
      'number.max': 'Height cannot exceed 300 cm'
    }),
  
  weight: Joi.number()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'number.base': 'Weight must be a number',
      'number.min': 'Weight must be at least 10 kg',
      'number.max': 'Weight cannot exceed 500 kg'
    }),
  
  fitnessLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
    .messages({
      'any.only': 'Fitness level must be: beginner, intermediate, or advanced'
    }),
  
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
      'array.base': 'Fitness goals must be an array',
      'array.items': 'Invalid fitness goal. Must be: lose-weight, gain-muscle, improve-cardio, increase-strength, or flexibility'
    })
});

/**
 * User Health Metrics Validation
 * Validates health metrics update requests
 */
const userMetricsValidation = Joi.object({
  height: Joi.number()
    .min(50)
    .max(300)
    .optional()
    .messages({
      'number.base': 'Height must be a number',
      'number.min': 'Height must be at least 50 cm',
      'number.max': 'Height cannot exceed 300 cm'
    }),
  
  weight: Joi.number()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'number.base': 'Weight must be a number',
      'number.min': 'Weight must be at least 10 kg',
      'number.max': 'Weight cannot exceed 500 kg'
    }),
  
  age: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.base': 'Age must be a number',
      'number.min': 'Age must be at least 13',
      'number.max': 'Age cannot exceed 120'
    }),
  
  bmi: Joi.number()
    .min(10)
    .max(50)
    .optional()
    .messages({
      'number.base': 'BMI must be a number',
      'number.min': 'BMI must be at least 10',
      'number.max': 'BMI cannot exceed 50'
    })
});

/**
 * User Preferences Validation
 * Validates user fitness preferences
 */
const userPreferencesValidation = Joi.object({
  preferredWorkoutDays: Joi.array()
    .items(
      Joi.number()
        .min(0)
        .max(6)
        .messages({
          'number.base': 'Day must be a number',
          'number.min': 'Day must be between 0 (Sunday) and 6 (Saturday)',
          'number.max': 'Day must be between 0 (Sunday) and 6 (Saturday)'
        })
    )
    .optional()
    .messages({
      'array.base': 'Preferred workout days must be an array'
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
      'array.base': 'Preferred workout types must be an array',
      'array.items': 'Invalid workout type. Must be: strength-training, cardio, yoga, hiit, or flexibility'
    }),
  
  preferredGym: Joi.string()
    .optional()
    .messages({
      'string.base': 'Preferred gym must be a string'
    }),
  
  preferredTrainer: Joi.string()
    .optional()
    .messages({
      'string.base': 'Preferred trainer must be a string'
    }),
  
  notificationPreferences: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    workoutReminders: Joi.boolean().optional(),
    goalReminders: Joi.boolean().optional(),
    progressReports: Joi.boolean().optional()
  }).optional()
});

/**
 * User Settings Validation
 * Validates user account settings
 */
const userSettingsValidation = Joi.object({
  language: Joi.string()
    .valid('en', 'es', 'fr', 'de', 'zh', 'ja')
    .optional()
    .default('en')
    .messages({
      'any.only': 'Language must be: en, es, fr, de, zh, or ja'
    }),
  
  timezone: Joi.string()
    .optional()
    .messages({
      'string.base': 'Timezone must be a string'
    }),
  
  units: Joi.object({
    weight: Joi.string()
      .valid('kg', 'lbs')
      .optional()
      .default('kg'),
    
    height: Joi.string()
      .valid('cm', 'ft')
      .optional()
      .default('cm'),
    
    distance: Joi.string()
      .valid('km', 'mi')
      .optional()
      .default('km')
  }).optional(),
  
  privacy: Joi.object({
    showProfile: Joi.boolean().optional(),
    showWorkouts: Joi.boolean().optional(),
    showGoals: Joi.boolean().optional(),
    showProgress: Joi.boolean().optional()
  }).optional()
});

/**
 * User ID Validation
 * Validates user ID parameter
 */
const userIdValidation = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.base': 'User ID must be a string',
      'any.required': 'User ID is required'
    })
});

/**
 * User Search Validation
 * Validates user search query parameters
 */
const userSearchValidation = Joi.object({
  search: Joi.string()
    .optional()
    .messages({
      'string.base': 'Search query must be a string'
    }),
  
  fitnessLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
    .messages({
      'any.only': 'Fitness level must be: beginner, intermediate, or advanced'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say')
    .optional()
    .messages({
      'any.only': 'Gender must be: male, female, other, or prefer-not-to-say'
    }),
  
  ageMin: Joi.number()
    .min(13)
    .max(120)
    .optional()
    .messages({
      'number.base': 'Minimum age must be a number',
      'number.min': 'Minimum age must be at least 13',
      'number.max': 'Minimum age cannot exceed 120'
    }),
  
  ageMax: Joi.number()
    .min(13)
    .max(120)
    .greater(Joi.ref('ageMin'))
    .optional()
    .messages({
      'number.base': 'Maximum age must be a number',
      'number.min': 'Maximum age must be at least 13',
      'number.max': 'Maximum age cannot exceed 120',
      'number.greater': 'Maximum age must be greater than minimum age'
    }),
  
  page: Joi.number()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

/**
 * User Stats Query Validation
 * Validates user statistics query
 */
const userStatsValidation = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year', 'all')
    .optional()
    .default('month')
    .messages({
      'any.only': 'Period must be: week, month, quarter, year, or all'
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
 * Bulk User Update Validation
 * Validates bulk user update operations
 */
const bulkUserUpdateValidation = Joi.object({
  userIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'User IDs must be an array',
      'array.min': 'At least one user ID is required',
      'any.required': 'User IDs are required'
    }),
  
  updates: Joi.object({
    fitnessLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional(),
    
    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional(),
    
    role: Joi.string()
      .valid('user', 'trainer', 'admin')
      .optional()
  }).required()
});

/**
 * User Account Deletion Validation
 */
const userDeletionValidation = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  
  confirm: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must confirm account deletion',
      'any.required': 'Confirmation is required'
    })
});

/**
 * User Email Update Validation
 */
const userEmailUpdateValidation = Joi.object({
  newEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'New email is required',
      'any.required': 'New email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

/**
 * User Notification Preferences Validation
 */
const userNotificationPreferencesValidation = Joi.object({
  email: Joi.object({
    enabled: Joi.boolean().optional(),
    frequency: Joi.string()
      .valid('instant', 'daily', 'weekly')
      .optional()
      .default('instant'),
    types: Joi.array()
      .items(
        Joi.string().valid(
          'workout_reminder',
          'goal_milestone',
          'progress_report',
          'recommendation',
          'achievement'
        )
      )
      .optional()
  }).optional(),
  
  push: Joi.object({
    enabled: Joi.boolean().optional(),
    types: Joi.array()
      .items(
        Joi.string().valid(
          'workout_reminder',
          'goal_milestone',
          'progress_report',
          'recommendation',
          'achievement'
        )
      )
      .optional()
  }).optional(),
  
  sms: Joi.object({
    enabled: Joi.boolean().optional(),
    types: Joi.array()
      .items(
        Joi.string().valid(
          'workout_reminder',
          'goal_milestone'
        )
      )
      .optional()
  }).optional()
});

module.exports = {
  // Main user validations
  userProfileValidation,
  userMetricsValidation,
  userPreferencesValidation,
  userSettingsValidation,
  
  // User operation validations
  userIdValidation,
  userSearchValidation,
  userStatsValidation,
  bulkUserUpdateValidation,
  userDeletionValidation,
  userEmailUpdateValidation,
  userNotificationPreferencesValidation
};