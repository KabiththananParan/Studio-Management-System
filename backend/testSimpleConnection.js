import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Simple connection test
const testConnection = async () => {
  try {
    await connectDB();
    console.log('✅ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();