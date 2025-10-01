import dotenv from "dotenv";
import mongoose from "mongoose";
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

const testBookingAPI = async () => {
  try {
    await connectDB();

    // Get a test user
    const user = await User.findOne({ email: "john@gmail.com" });
    if (!user) {
      console.log("❌ Test user not found. Please run createTestUsers.js first.");
      process.exit(1);
    }
    console.log("✅ Found test user:", user.email);

    // Get a test package
    const testPackage = await Package.findOne({});
    if (!testPackage) {
      console.log("❌ No packages found. Please run createTestPackages.js first.");
      process.exit(1);
    }
    console.log("✅ Found test package:", testPackage.name);

    // Get an available slot for this package
    const availableSlot = await Slot.findOne({ 
      packageId: testPackage._id, 
      isAvailable: true,
      status: 'available'
    });
    if (!availableSlot) {
      console.log("❌ No available slots found. Please run createTestSlots.js first.");
      process.exit(1);
    }
    console.log("✅ Found available slot:", availableSlot.date, availableSlot.startTime);

    // Test booking data (matching the controller structure)
    const totalAmount = testPackage.price + availableSlot.price;
    
    const bookingData = {
      customerInfo: {
        name: "John Doe",
        email: "john@gmail.com",
        phone: "077 123 4567",
        address: "123 Main Street, Colombo, Sri Lanka"
      },
      packageId: testPackage._id,
      packageName: testPackage.name,
      packagePrice: testPackage.price,
      slotId: availableSlot._id.toString(),
      bookingDate: availableSlot.date,
      bookingTime: availableSlot.startTime,
      duration: testPackage.duration || 3,
      slotPrice: availableSlot.price,
      totalAmount,
      paymentMethod: "card",
      paymentStatus: 'pending',
      bookingStatus: 'confirmed',
      userId: user._id
    };

    // Create a test booking
    const booking = new Booking(bookingData);
    await booking.save();
    console.log("✅ Test booking created successfully:", booking._id);

    // Test fetching user bookings
    const userBookings = await Booking.find({ userId: user._id })
      .populate('packageId', 'name price duration')
      .populate('slotId', 'date startTime endTime price')
      .sort({ createdAt: -1 });

    console.log("✅ User bookings found:", userBookings.length);
    userBookings.forEach(booking => {
      console.log(`  - ${booking.packageId.name} on ${booking.slotId.date.toDateString()} at ${booking.slotId.startTime} - $${booking.totalAmount} (${booking.status})`);
    });

    // Test booking statistics
    const stats = await Booking.getStats();
    console.log("✅ Booking statistics:", stats);

    console.log("\n🎉 All booking API tests passed!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error testing booking API:", error);
    process.exit(1);
  }
};

// Run the test
testBookingAPI();