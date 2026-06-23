const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['strength-training', 'cardio', 'yoga', 'hiit', 'flexibility']
  },
  muscleGroup: {
    type: [String],
    required: [true, 'Please add muscle groups'],
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'cardio', 'full-body']
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  caloriesPerMinute: {
    type: Number,
    required: [true, 'Please add calories burned per minute'],
    min: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  instructions: [{
    type: String
  }],
  equipmentNeeded: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ Instead, add individual indexes if needed:
ExerciseSchema.index({ name: 1 });
ExerciseSchema.index({ category: 1 });
ExerciseSchema.index({ muscleGroup: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);