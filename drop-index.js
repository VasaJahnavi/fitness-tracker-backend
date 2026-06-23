const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collection = mongoose.connection.collection('exercises');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes.map(i => i.name));
    
    // Drop the problematic index
    await collection.dropIndex('name_text_category_1_muscleGroup_1');
    console.log('✅ Index dropped successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropIndex();