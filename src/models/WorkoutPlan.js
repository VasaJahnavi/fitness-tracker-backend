const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a workout plan name'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['strength-training', 'cardio', 'yoga', 'hiit', 'flexibility']
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes'],
    min: 1
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      min: 1,
      default: 3
    },
    reps: {
      type: Number,
      min: 1
    },
    duration: {
      type: Number,
      min: 1
    },
    restTime: {
      type: Number,
      default: 60
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  totalCalories: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Pre-save middleware to calculate total calories
WorkoutPlanSchema.pre('save', async function(next) {
  if (this.isModified('exercises') || this.isNew) {
    // This would require populating exercises, better handled in controller
    // For now, we'll keep it as a placeholder
    this.totalCalories = 0;
  }
  next();
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);