import Refund from './models/Refund.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testRefundNumber() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const refundNumber = await Refund.generateRefundNumber();
    console.log('Generated refund number:', refundNumber);
    
    mongoose.disconnect();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test error:', error);
    mongoose.disconnect();
  }
}

testRefundNumber();