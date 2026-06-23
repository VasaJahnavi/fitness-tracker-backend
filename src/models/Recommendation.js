const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['workout-plan', 'exercise', 'daily-activity']
  },
  recommendation: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days
  }
}, {
  timestamps: true
});

// Index for efficient queries
RecommendationSchema.index({ user: 1, createdAt: -1 });
RecommendationSchema.index({ user: 1, expiresAt: 1 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);