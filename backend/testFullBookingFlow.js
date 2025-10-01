import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Package from "./models/Package.js";
import Slot from "./models/Slot.js";
import Booking from "./models/Booking.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB Connection Failed ❌", err.message);
    process.exit(1);
  }
};

const testFullBookingFlow = async () => {
  try {
    await connectDB();

    // 1. Get test user and generate JWT token
    const user = await User.findOne({ email: "john@gmail.com" });
    if (!user) {
      console.log("❌ Test user not found");
      process.exit(1);
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    console.log("✅ User authenticated:", user.email);

    // 2. Get available package and slot
    const testPackage = await Package.findOne({});
    const availableSlot = await Slot.findOne({ 
      packageId: testPackage._id, 
      isAvailable: true,
      status: 'available'
    });

    console.log("✅ Found package:", testPackage.name, "$" + testPackage.price);
    console.log("✅ Found slot:", availableSlot.date.toDateString(), availableSlot.startTime);

    // 3. Simulate booking creation API call
    const bookingData = {
      packageId: testPackage._id,
      slotId: availableSlot._id,
      customerInfo: {
        name: "John Doe",
        email: "john@gmail.com",
        phone: "077 123 4567",
        address: "123 Main Street, Colombo, Sri Lanka"
      },
      paymentMethod: "card"
    };

    console.log("\\n📤 Simulating booking creation API...");
    
    // Create booking with userId (as controller would)
    const totalAmount = testPackage.price + availableSlot.price;
    const booking = new Booking({
      userId: user._id, // This is what our controller sets
      customerInfo: bookingData.customerInfo,
      packageId: testPackage._id,
      packageName: testPackage.name,
      packagePrice: testPackage.price,
      slotId: availableSlot._id.toString(),
      bookingDate: availableSlot.date,
      bookingTime: availableSlot.startTime,
      duration: testPackage.duration || 3,
      slotPrice: availableSlot.price,
      totalAmount,
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: 'pending',
      bookingStatus: 'confirmed',
      notes: `Booking created for ${bookingData.customerInfo.name}`
    });

    await booking.save();
    console.log("✅ Booking created with ID:", booking._id);
    console.log("   Booking reference:", booking.bookingReference);
    console.log("   Total amount: $" + booking.totalAmount);

    // 4. Update slot status
    await Slot.findByIdAndUpdate(availableSlot._id, {
      status: 'booked',
      isAvailable: false,
      bookingId: booking._id
    });
    console.log("✅ Slot marked as booked");

    // 5. Test getUserBookings logic
    console.log("\\n📤 Testing user bookings retrieval...");
    
    // Query bookings by userId (as our controller does)
    const userBookings = await Booking.find({ 
      userId: user._id 
    })
    .populate('packageId', 'name price duration description')
    .sort({ createdAt: -1 });

    console.log("✅ Found", userBookings.length, "bookings for user");
    userBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.packageName} - $${booking.totalAmount} (${booking.bookingStatus})`);
      console.log(`      Date: ${booking.bookingDate.toDateString()} at ${booking.bookingTime}`);
      console.log(`      Payment: ${booking.paymentStatus}`);
    });

    // 6. Test booking statistics
    const stats = await Booking.getStats();
    console.log("\\n📊 Booking Statistics:");
    console.log("   Total Bookings:", stats.totalBookings);
    console.log("   Total Revenue: $" + stats.totalRevenue);
    console.log("   Completed:", stats.completedBookings);
    console.log("   Cancelled:", stats.cancelledBookings);
    console.log("   Pending Payments:", stats.pendingPayments);

    // 7. Test cancellation logic
    console.log("\\n🛑 Testing cancellation...");
    const canCancel = booking.canBeCancelled();
    console.log("   Can be cancelled:", canCancel);
    if (canCancel) {
      booking.bookingStatus = 'cancelled';
      await booking.save();
      console.log("✅ Booking cancelled successfully");
    }

    console.log("\\n🎉 Full booking flow test completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error in booking flow test:", error);
    process.exit(1);
  }
};

testFullBookingFlow();