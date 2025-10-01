import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import Booking from "./models/Booking.js";

// Connect to database
connectDB().catch(console.error);

const debugRefundEligibility = async () => {
  try {
    // Let's find a booking and see its structure
    const booking = await Booking.findOne().populate('userId');
    
    if (booking) {
      console.log('Sample booking structure:');
      console.log('Booking ID:', booking._id);
      console.log('User ID (raw):', booking.userId);
      console.log('User ID (string):', booking.userId?.toString());
      console.log('Booking Date:', booking.bookingDate);
      console.log('Payment Status:', booking.paymentStatus);
      console.log('Booking Status:', booking.bookingStatus);
    } else {
      console.log('No bookings found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugRefundEligibility();