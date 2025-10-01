import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import User from './models/User.js';
import Refund from './models/Refund.js';

dotenv.config();

async function testRefundAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find the specific booking and user from your error log
    const bookingId = '68dd1b96566a54ce02676eb0';
    const adminUserId = '68da498ce39231dc0b5f798f';
    
    console.log('Looking for booking:', bookingId);
    const booking = await Booking.findById(bookingId).populate('userId');
    
    if (!booking) {
      console.log('❌ Booking not found');
      return;
    }
    
    console.log('✅ Found booking:', {
      id: booking._id,
      customerEmail: booking.customerInfo?.email,
      userId: booking.userId?._id || booking.userId,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus
    });
    
    console.log('Looking for admin user:', adminUserId);
    const adminUser = await User.findById(adminUserId);
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Found admin user:', {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      isAdmin: adminUser.role === 'admin'
    });
    
    // Check if refund already exists
    const existingRefund = await Refund.findOne({ bookingId: booking._id });
    if (existingRefund) {
      console.log('⚠️ Refund already exists:', existingRefund.refundNumber);
      // Clean up existing test refund
      await Refund.findByIdAndDelete(existingRefund._id);
      console.log('🧹 Cleaned up existing refund');
    }
    
    // Simulate the refund creation process
    console.log('🧪 Testing refund creation...');
    
    // Generate refund number
    const refundNumber = await Refund.generateRefundNumber();
    console.log('Generated refund number:', refundNumber);
    
    // Create refund as admin for this booking
    const refund = new Refund({
      bookingId: booking._id,
      userId: adminUser._id, // Admin creating refund
      refundNumber,
      requestedAmount: booking.totalAmount * 0.8,
      reason: 'cancelled_by_customer',
      reasonDescription: 'Test refund by admin',
      customerInfo: {
        name: booking.customerInfo.name,
        email: booking.customerInfo.email,
        phone: booking.customerInfo.phone
      },
      originalTransactionId: booking.paymentId || booking._id.toString(),
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - Admin',
        refundPolicy: 'Admin created refund'
      }
    });
    
    await refund.save();
    console.log('✅ Refund created successfully!');
    console.log('Refund details:', {
      id: refund._id,
      refundNumber: refund.refundNumber,
      status: refund.status,
      requestedAmount: refund.requestedAmount,
      userId: refund.userId,
      bookingId: refund.bookingId
    });
    
    // Clean up
    await Refund.findByIdAndDelete(refund._id);
    console.log('🧹 Test refund cleaned up');
    
    mongoose.disconnect();
    console.log('✅ Test completed successfully - The refund system is working!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    mongoose.disconnect();
  }
}

testRefundAPI();