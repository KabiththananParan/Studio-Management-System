import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const checkIndexes = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking notification collection indexes...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('notifications');
    
    // Get current indexes
    const indexes = await collection.indexes();
    console.log('📊 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique || false}`);
      console.log('');
    });
    
    // Try to drop the old unique index if it exists
    try {
      await collection.dropIndex('notificationId_1');
      console.log('✅ Dropped old notificationId_1 index');
    } catch (e) {
      console.log('ℹ️  Old notificationId_1 index not found (this is ok)');
    }
    
    // Check the collection again
    const newIndexes = await collection.indexes();
    console.log('📊 Indexes after cleanup:');
    newIndexes.forEach((index, i) => {
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

checkIndexes();