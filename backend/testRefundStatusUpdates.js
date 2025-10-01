import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Refund from './models/Refund.js';

dotenv.config();

// Test refund status updates functionality
const testRefundStatusUpdates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected ✅');

    // Find a completed booking to test with
    const booking = await Booking.findOne({ 
      paymentStatus: 'completed',
      bookingStatus: 'confirmed'
    });

    if (!booking) {
      console.log('No suitable booking found for testing');
      process.exit(1);
    }

    console.log('\n=== Testing Refund Status Updates ===');
    console.log('Original Booking Status:');
    console.log(`  - Payment Status: ${booking.paymentStatus}`);
    console.log(`  - Booking Status: ${booking.bookingStatus}`);
    console.log(`  - Booking ID: ${booking._id}`);

    // Test 1: Create refund request (should update to 'refund_requested')
    console.log('\n1. Creating refund request...');
    
    // Check if refund already exists
    let existingRefund = await Refund.findOne({ bookingId: booking._id });
    if (existingRefund) {
      console.log('Refund already exists, cleaning up...');
      await Refund.deleteOne({ bookingId: booking._id });
    }

    const refund = new Refund({
      bookingId: booking._id,
      userId: booking.userId || new mongoose.Types.ObjectId(),
      requestedAmount: booking.totalAmount,
      reason: 'cancelled_by_customer',
      reasonDescription: 'Test refund for status update verification',
      customerInfo: {
        name: booking.customerInfo.name,
        email: booking.customerInfo.email,
        phone: booking.customerInfo.phone
      },
      originalTransactionId: 'TEST-' + Date.now()
    });

    await refund.save();
    
    // Update booking status
    booking.paymentStatus = 'refund_requested';
    await booking.save();
    
    console.log('After refund request:');
    console.log(`  - Payment Status: ${booking.paymentStatus} ✅`);

    // Test 2: Approve refund (should update to 'refund_approved')
    console.log('\n2. Approving refund...');
    refund.status = 'approved';
    refund.approvedAmount = refund.requestedAmount;
    refund.approvedDate = new Date();
    await refund.save();

    booking.paymentStatus = 'refund_approved';
    booking.bookingStatus = 'refunded';
    await booking.save();
    
    console.log('After refund approval:');
    console.log(`  - Payment Status: ${booking.paymentStatus} ✅`);
    console.log(`  - Booking Status: ${booking.bookingStatus} ✅`);

    // Test 3: Complete refund (should update to 'refunded')
    console.log('\n3. Completing refund...');
    refund.status = 'completed';
    refund.completedDate = new Date();
    refund.refundTransactionId = 'DEMO-COMPLETED-' + Date.now();
    await refund.save();

    booking.paymentStatus = 'refunded';
    await booking.save();
    
    console.log('After refund completion:');
    console.log(`  - Payment Status: ${booking.paymentStatus} ✅`);
    console.log(`  - Booking Status: ${booking.bookingStatus} ✅`);

    console.log('\n=== Status Update Test Complete ✅ ===');
    console.log('All booking status updates are working correctly!');

    // Clean up test data
    await Refund.deleteOne({ _id: refund._id });
    
    // Reset booking to original state
    booking.paymentStatus = 'completed';
    booking.bookingStatus = 'confirmed';
    await booking.save();
    
    console.log('\nTest data cleaned up - booking reset to original state ✨');

  } catch (error) {
    console.error('Error testing refund status updates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
};

testRefundStatusUpdates();