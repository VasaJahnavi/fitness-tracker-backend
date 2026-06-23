const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('../models/Exercise');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const exercises = [
  // Strength Training
  {
    name: 'Bench Press',
    category: 'strength-training',
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 5.5,
    description: 'Compound exercise targeting chest, triceps, and shoulders.',
    instructions: ['Lie flat on bench', 'Grip barbell', 'Lower to chest', 'Push up'],
    equipmentNeeded: ['barbell', 'bench'],
    isActive: true
  },
  {
    name: 'Squat',
    category: 'strength-training',
    muscleGroup: ['legs', 'glutes', 'core'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 6.0,
    description: 'Compound exercise targeting legs, glutes, and core.',
    instructions: ['Stand feet shoulder-width', 'Lower body', 'Push through heels'],
    equipmentNeeded: ['barbell'],
    isActive: true
  },
  {
    name: 'Deadlift',
    category: 'strength-training',
    muscleGroup: ['back', 'glutes', 'legs', 'core'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 6.5,
    description: 'Compound exercise targeting posterior chain.',
    instructions: ['Stand over barbell', 'Grip bar', 'Lift with straight back'],
    equipmentNeeded: ['barbell', 'weight plates'],
    isActive: true
  },
  {
    name: 'Push-up',
    category: 'strength-training',
    muscleGroup: ['chest', 'triceps', 'shoulders', 'core'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 4.0,
    description: 'Bodyweight exercise targeting chest, triceps, and shoulders.',
    instructions: ['Start in plank', 'Lower body', 'Push back up'],
    equipmentNeeded: [],
    isActive: true
  },
  {
    name: 'Pull-up',
    category: 'strength-training',
    muscleGroup: ['back', 'biceps', 'shoulders'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 5.0,
    description: 'Bodyweight exercise targeting back and biceps.',
    instructions: ['Hang from bar', 'Pull body up', 'Lower with control'],
    equipmentNeeded: ['pull-up bar'],
    isActive: true
  },

  // Cardio
  {
    name: 'Running',
    category: 'cardio',
    muscleGroup: ['cardio', 'legs'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 8.5,
    description: 'High-intensity cardiovascular exercise.',
    instructions: ['Warm up walk', 'Start running', 'Cool down walk'],
    equipmentNeeded: ['running shoes'],
    isActive: true
  },
  {
    name: 'Cycling',
    category: 'cardio',
    muscleGroup: ['cardio', 'legs'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 7.0,
    description: 'Low-impact cardiovascular exercise.',
    instructions: ['Adjust seat', 'Start pedaling', 'Maintain resistance'],
    equipmentNeeded: ['bicycle', 'helmet'],
    isActive: true
  },
  {
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroup: ['cardio', 'full-body'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 6.5,
    description: 'Full-body cardio exercise.',
    instructions: ['Stand with feet together', 'Jump and spread feet', 'Jump back'],
    equipmentNeeded: [],
    isActive: true
  },

  // HIIT
  {
    name: 'Burpee',
    category: 'hiit',
    muscleGroup: ['full-body', 'cardio'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 9.0,
    description: 'High-intensity full-body exercise.',
    instructions: ['Stand', 'Drop to squat', 'Kick feet back', 'Push-up', 'Jump up'],
    equipmentNeeded: [],
    isActive: true
  },
  {
    name: 'Mountain Climbers',
    category: 'hiit',
    muscleGroup: ['core', 'cardio', 'shoulders'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 8.0,
    description: 'High-intensity core and cardio exercise.',
    instructions: ['Start in plank', 'Drive knees to chest', 'Quickly switch legs'],
    equipmentNeeded: [],
    isActive: true
  },

  // Yoga
  {
    name: 'Downward Dog',
    category: 'yoga',
    muscleGroup: ['core', 'shoulders', 'legs'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 2.5,
    description: 'Foundational yoga pose stretching the entire body.',
    instructions: ['Start on all fours', 'Tuck toes', 'Lift hips to ceiling'],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },
  {
    name: 'Warrior Pose',
    category: 'yoga',
    muscleGroup: ['core', 'legs', 'shoulders'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 3.0,
    description: 'Standing yoga pose building strength and balance.',
    instructions: ['Stand wide', 'Turn right foot', 'Bend right knee', 'Reach arms up'],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },

  // Flexibility
  {
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscleGroup: ['legs'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 1.5,
    description: 'Stretch targeting the hamstrings.',
    instructions: ['Sit with legs extended', 'Reach toward toes', 'Hold for 30 seconds'],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },
  {
    name: 'Quad Stretch',
    category: 'flexibility',
    muscleGroup: ['legs'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 1.5,
    description: 'Stretch targeting the quadriceps.',
    instructions: ['Stand on one leg', 'Pull foot toward glutes', 'Hold for 30 seconds'],
    equipmentNeeded: [],
    isActive: true
  }
];

const seedExercises = async () => {
  try {
    await Exercise.deleteMany({});
    console.log('🧹 Existing exercises removed');

    await Exercise.insertMany(exercises);
    console.log(`✅ ${exercises.length} exercises seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    process.exit(1);
  }
};

seedExercises();