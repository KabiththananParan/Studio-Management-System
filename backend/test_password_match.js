import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const testPasswordMatch = async () => {
  try {
    await connectDB();
    
    const email = 'kabiththananparan22@gmail.com';
    const testPassword = 'K20a03b05i22$';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    
    // Test with bcrypt.compare (current login method)
    const directMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt.compare result:', directMatch);
    
    // Test with User model method
    const modelMatch = await user.matchPassword(testPassword);
    console.log('User.matchPassword result:', modelMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testPasswordMatch();