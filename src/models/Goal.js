const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please add goal type'],
    enum: ['weight-loss', 'weight-gain', 'daily-exercise', 'weekly-workout', 'strength', 'cardio']
  },
  targetValue: {
    type: Number,
    required: [true, 'Please add target value']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  targetUnit: {
    type: String,
    required: [true, 'Please add target unit'],
    enum: ['kg', 'lbs', 'minutes', 'hours', 'sessions', 'reps']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add target date']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused'],
    default: 'active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    description: String,
    achieved: {
      type: Boolean,
      default: false
    },
    achievedAt: Date
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate progress percentage
GoalSchema.methods.calculateProgress = function(currentValue) {
  this.currentValue = currentValue;
  if (this.targetValue > 0) {
    this.progress = Math.min((this.currentValue / this.targetValue) * 100, 100);
  }
  return this.progress;
};

module.exports = mongoose.model('Goal', GoalSchema);