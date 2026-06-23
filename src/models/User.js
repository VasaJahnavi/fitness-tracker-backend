const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50 cm'],
    max: [300, 'Height must be less than 300 cm']
  },
  weight: {
    type: Number,
    min: [10, 'Weight must be at least 10 kg'],
    max: [500, 'Weight must be less than 500 kg']
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  fitnessGoals: [{
    type: String,
    enum: ['lose-weight', 'gain-muscle', 'improve-cardio', 'increase-strength', 'flexibility']
  }],
  preferences: {
    preferredWorkoutDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    preferredWorkoutTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    preferredWorkoutTypes: [{
      type: String,
      enum: ['strength-training', 'cardio', 'yoga', 'hiit', 'flexibility']
    }]
  },
  settings: {
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    units: {
      weight: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      },
      height: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      },
      distance: {
        type: String,
        enum: ['km', 'mi'],
        default: 'km'
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showWorkouts: {
        type: Boolean,
        default: true
      },
      showGoals: {
        type: Boolean,
        default: true
      },
      showProgress: {
        type: Boolean,
        default: true
      }
    }
  },
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'instant'
      },
      types: [{
        type: String,
        enum: ['workout_reminder', 'goal_milestone', 'progress_report', 'recommendation', 'achievement']
      }]
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: [{
        type: String,
        enum: ['workout_reminder', 'goal_milestone', 'progress_report', 'recommendation', 'achievement']
      }]
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      types: [{
        type: String,
        enum: ['workout_reminder', 'goal_milestone']
      }]
    }
  },
  totalWorkouts: {
    type: Number,
    default: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastWorkoutDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full profile completion percentage
UserSchema.virtual('profileCompletion').get(function() {
  const fields = ['name', 'email', 'age', 'gender', 'height', 'weight', 'fitnessLevel'];
  const filled = fields.filter(field => this[field] !== undefined && this[field] !== null && this[field] !== '');
  return Math.round((filled.length / fields.length) * 100);
});

module.exports = mongoose.model('User', UserSchema);