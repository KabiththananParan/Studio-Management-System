import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';

// Ensure we load the backend .env using the script directory so it works no matter cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const listTestUsers = async () => {
  try {
    await connectDB();
    
    const users = await User.find({}).select('firstName lastName email userName isVerified');
    
    console.log('Available test users:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Username: ${user.userName}`);
      console.log(`  Verified: ${user.isVerified}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listTestUsers();