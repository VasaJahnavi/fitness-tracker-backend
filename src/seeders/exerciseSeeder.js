const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('../models/Exercise');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const exercises = [
  // Strength Training Exercises
  {
    name: 'Bench Press',
    category: 'strength-training',
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 5.5,
    description: 'A compound exercise that targets the chest, triceps, and shoulders.',
    instructions: [
      'Lie flat on a bench with your feet on the ground',
      'Grip the barbell with hands slightly wider than shoulder-width',
      'Lower the bar to your chest',
      'Push the bar back up to starting position'
    ],
    equipmentNeeded: ['barbell', 'bench'],
    isActive: true
  },
  {
    name: 'Squat',
    category: 'strength-training',
    muscleGroup: ['legs', 'glutes', 'core'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 6.0,
    description: 'A compound exercise that targets the legs, glutes, and core.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending your knees and hips',
      'Go down until your thighs are parallel to the ground',
      'Push through your heels to return to standing'
    ],
    equipmentNeeded: ['barbell', 'squat rack'],
    isActive: true
  },
  {
    name: 'Deadlift',
    category: 'strength-training',
    muscleGroup: ['back', 'glutes', 'legs', 'core'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 6.5,
    description: 'A compound exercise that targets the posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep your back straight and lift the bar',
      'Stand up straight with the bar at hip level'
    ],
    equipmentNeeded: ['barbell', 'weight plates'],
    isActive: true
  },
  {
    name: 'Push-up',
    category: 'strength-training',
    muscleGroup: ['chest', 'triceps', 'shoulders', 'core'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 4.0,
    description: 'A bodyweight exercise that targets the chest, triceps, and shoulders.',
    instructions: [
      'Start in a plank position with hands under shoulders',
      'Lower your body until your chest nearly touches the ground',
      'Push back up to starting position'
    ],
    equipmentNeeded: [],
    isActive: true
  },
  {
    name: 'Pull-up',
    category: 'strength-training',
    muscleGroup: ['back', 'biceps', 'shoulders'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 5.0,
    description: 'A bodyweight exercise that targets the back and biceps.',
    instructions: [
      'Hang from a pull-up bar with hands shoulder-width apart',
      'Pull your body up until your chin is above the bar',
      'Lower yourself back down with control'
    ],
    equipmentNeeded: ['pull-up bar'],
    isActive: true
  },

  // Cardio Exercises
  {
    name: 'Running',
    category: 'cardio',
    muscleGroup: ['cardio', 'legs'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 8.5,
    description: 'High-intensity cardiovascular exercise.',
    instructions: [
      'Start with a warm-up walk',
      'Begin running at a comfortable pace',
      'Maintain proper form with arms swinging naturally',
      'Cool down with a walk after running'
    ],
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
    instructions: [
      'Adjust seat height to proper level',
      'Start pedaling at a comfortable pace',
      'Maintain steady resistance',
      'Alternate between sitting and standing positions'
    ],
    equipmentNeeded: ['bicycle', 'helmet'],
    isActive: true
  },
  {
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroup: ['cardio', 'full-body'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 6.5,
    description: 'A full-body cardio exercise.',
    instructions: [
      'Stand with feet together and arms at sides',
      'Jump while spreading feet and raising arms overhead',
      'Jump back to starting position'
    ],
    equipmentNeeded: [],
    isActive: true
  },

  // HIIT Exercises
  {
    name: 'Burpee',
    category: 'hiit',
    muscleGroup: ['full-body', 'cardio'],
    difficultyLevel: 'advanced',
    caloriesPerMinute: 9.0,
    description: 'A high-intensity full-body exercise.',
    instructions: [
      'Start in a standing position',
      'Drop into a squat position and place hands on the ground',
      'Kick feet back into a plank position',
      'Perform a push-up',
      'Jump feet back to squat position',
      'Jump up with arms raised'
    ],
    equipmentNeeded: [],
    isActive: true
  },
  {
    name: 'Mountain Climbers',
    category: 'hiit',
    muscleGroup: ['core', 'cardio', 'shoulders'],
    difficultyLevel: 'intermediate',
    caloriesPerMinute: 8.0,
    description: 'A high-intensity core and cardio exercise.',
    instructions: [
      'Start in a plank position',
      'Drive one knee toward your chest',
      'Quickly switch legs in a running motion',
      'Maintain a flat back throughout'
    ],
    equipmentNeeded: [],
    isActive: true
  },

  // Yoga Exercises
  {
    name: 'Downward Dog',
    category: 'yoga',
    muscleGroup: ['core', 'shoulders', 'hamstrings'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 2.5,
    description: 'A foundational yoga pose that stretches the entire body.',
    instructions: [
      'Start on all fours',
      'Tuck toes and lift hips toward ceiling',
      'Press chest toward thighs and heels toward ground',
      'Hold for 5-10 breaths'
    ],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },
  {
    name: 'Warrior Pose',
    category: 'yoga',
    muscleGroup: ['core', 'legs', 'shoulders'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 3.0,
    description: 'A standing yoga pose that builds strength and balance.',
    instructions: [
      'Stand with feet wide apart',
      'Turn right foot out and left foot in',
      'Bend right knee while keeping left leg straight',
      'Reach arms up and hold'
    ],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },

  // Flexibility Exercises
  {
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscleGroup: ['legs', 'hamstrings'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 1.5,
    description: 'A stretch targeting the hamstrings.',
    instructions: [
      'Sit on the ground with legs extended',
      'Reach forward toward your toes',
      'Hold the stretch for 30 seconds'
    ],
    equipmentNeeded: ['yoga mat'],
    isActive: true
  },
  {
    name: 'Quad Stretch',
    category: 'flexibility',
    muscleGroup: ['legs', 'quads'],
    difficultyLevel: 'beginner',
    caloriesPerMinute: 1.5,
    description: 'A stretch targeting the quadriceps.',
    instructions: [
      'Stand on one leg',
      'Pull the other foot toward your glutes',
      'Hold the stretch for 30 seconds',
      'Switch sides'
    ],
    equipmentNeeded: [],
    isActive: true
  }
];

// Seed function
const seedExercises = async () => {
  try {
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('🧹 Existing exercises removed');

    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`✅ ${exercises.length} exercises seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    process.exit(1);
  }
};

// Run seed
seedExercises();