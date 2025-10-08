import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const createTestUser = async () => {
  try {
    await connectDB();
    
    // Delete existing test user if exists
    await User.deleteOne({ email: 'test@example.com' });
    
    // Create a new test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      userName: 'testuser',
      email: 'test@example.com',
      password: 'password123', // This will be hashed by the pre-save hook
      isVerified: true
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestUser();