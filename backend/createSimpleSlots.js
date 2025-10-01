import dotenv from "dotenv";
import mongoose from "mongoose";
import Slot from "./models/Slot.js";
import Package from "./models/Package.js";

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

const createSimpleSlots = async () => {
  try {
    await connectDB();

    // Get the first package
    const testPackage = await Package.findOne({});
    if (!testPackage) {
      console.log("❌ No packages found");
      process.exit(1);
    }
    console.log("✅ Using package:", testPackage.name);

    // Create a few simple slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slots = [
      {
        packageId: testPackage._id,
        date: tomorrow,
        startTime: "09:00",
        endTime: "12:00",
        price: 50,
        isAvailable: true,
        status: 'available'
      },
      {
        packageId: testPackage._id,
        date: tomorrow,
        startTime: "14:00",
        endTime: "17:00",
        price: 60,
        isAvailable: true,
        status: 'available'
      }
    ];

    // Delete existing slots for this package
    await Slot.deleteMany({ packageId: testPackage._id });

    // Create new slots
    const createdSlots = await Slot.insertMany(slots);
    console.log(`✅ Created ${createdSlots.length} test slots`);

    // Show created slots
    createdSlots.forEach(slot => {
      console.log(`  - ${slot.date.toDateString()} ${slot.startTime}-${slot.endTime} $${slot.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating slots:", error);
    process.exit(1);
  }
};

createSimpleSlots();