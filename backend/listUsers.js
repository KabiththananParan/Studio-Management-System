import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

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