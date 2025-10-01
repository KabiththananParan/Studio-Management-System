import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Refund from './models/Refund.js';
import Booking from './models/Booking.js';
import User from './models/User.js';

dotenv.config();

async function testRefundCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find a completed booking to test with
    const completedBooking = await Booking.findOne({ 
      paymentStatus: 'completed',
      bookingStatus: 'confirmed'
    }).populate('userId');
    
    if (!completedBooking) {
      console.log('No completed booking found for testing');
      return;
    }
    
    console.log('Found test booking:', completedBooking._id);
    console.log('Booking total amount:', completedBooking.totalAmount);
    console.log('Payment status:', completedBooking.paymentStatus);
    
    // Check if refund already exists
    const existingRefund = await Refund.findOne({ bookingId: completedBooking._id });
    if (existingRefund) {
      console.log('Refund already exists for this booking:', existingRefund.refundNumber);
      return;
    }
    
    // Generate refund number
    const refundNumber = await Refund.generateRefundNumber();
    console.log('Generated refund number:', refundNumber);
    
    // Create test refund
    const testRefund = new Refund({
      bookingId: completedBooking._id,
      userId: completedBooking.userId._id || completedBooking.userId,
      refundNumber,
      requestedAmount: completedBooking.totalAmount * 0.8, // 80% refund
      reason: 'cancelled_by_customer',
      reasonDescription: 'Test refund creation',
      customerInfo: {
        name: completedBooking.customerInfo.name,
        email: completedBooking.customerInfo.email,
        phone: completedBooking.customerInfo.phone
      },
      originalTransactionId: completedBooking.paymentId || completedBooking._id.toString(),
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        refundPolicy: 'Test refund policy'
      }
    });
    
    await testRefund.save();
    console.log('✅ Test refund created successfully!');
    console.log('Refund ID:', testRefund._id);
    console.log('Refund Number:', testRefund.refundNumber);
    console.log('Status:', testRefund.status);
    console.log('Requested Amount:', testRefund.requestedAmount);
    
    // Clean up test data
    await Refund.findByIdAndDelete(testRefund._id);
    console.log('🧹 Test refund cleaned up');
    
    mongoose.disconnect();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test error:', error);
    mongoose.disconnect();
  }
}

testRefundCreation();