const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Exercise'
    },
    sets: Number,
    reps: Number,
    weight: Number,
    duration: Number
  }],
  perceivedExertion: {
    type: Number,
    min: 1,
    max: 10
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'exhausted']
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);