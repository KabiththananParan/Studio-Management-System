import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const fixIndexes = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Fixing notification collection indexes...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('notifications');
    
    // Drop the non-unique compound index
    try {
      await collection.dropIndex('notificationId_1_adminId_1');
      console.log('✅ Dropped old compound index');
    } catch (e) {
      console.log('ℹ️  Old compound index not found');
    }
    
    // Create the proper unique compound index
    await collection.createIndex(
      { notificationId: 1, adminId: 1 }, 
      { unique: true, name: 'notificationId_1_adminId_1_unique' }
    );
    console.log('✅ Created unique compound index');
    
    // Verify the indexes
    const indexes = await collection.indexes();
    console.log('📊 Final indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique || false}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixIndexes();