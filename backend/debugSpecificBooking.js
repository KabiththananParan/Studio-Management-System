import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import Booking from "./models/Booking.js";
import mongoose from "mongoose";

// Connect to database
connectDB().catch(console.error);

const debugSpecificBooking = async () => {
  try {
    const bookingId = "68dd1b96566a54ce02676eb0";
    
    console.log('Searching for booking ID:', bookingId);
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.log('❌ Invalid ObjectId format');
      return;
    }
    
    // Find the specific booking
    const booking = await Booking.findById(bookingId);
    
    if (booking) {
      console.log('✅ Booking found:');
      console.log('- Booking ID:', booking._id.toString());
      console.log('- User ID:', booking.userId?.toString() || 'NULL (guest booking)');
      console.log('- Customer Email:', booking.customerInfo?.email);
      console.log('- Package Name:', booking.packageName);
      console.log('- Booking Date:', booking.bookingDate);
      console.log('- Payment Status:', booking.paymentStatus);
      console.log('- Booking Status:', booking.bookingStatus);
      console.log('- Total Amount:', booking.totalAmount);
    } else {
      console.log('❌ Booking not found');
      
      // Let's see what bookings exist
      const allBookings = await Booking.find().limit(5).select('_id userId customerInfo.email packageName');
      console.log('\n📋 Available bookings (first 5):');
      allBookings.forEach(b => {
        console.log(`- ID: ${b._id} | User: ${b.userId || 'guest'} | Email: ${b.customerInfo?.email} | Package: ${b.packageName}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugSpecificBooking();