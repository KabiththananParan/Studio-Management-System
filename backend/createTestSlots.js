import mongoose from "mongoose";
import dotenv from "dotenv";
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

const createTestSlots = async () => {
  try {
    await connectDB();

    // Clear existing slots
    await Slot.deleteMany({});
    console.log("Cleared existing slots");

    // Get all packages
    const packages = await Package.find({});
    if (packages.length === 0) {
      console.log("No packages found. Please create packages first.");
      process.exit(1);
    }

    const slots = [];
    const today = new Date();
    
    // Generate slots for the next 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      // Skip weekends for some variety
      if (date.getDay() === 0) continue; // Skip Sundays
      
      // Create slots for each package
      for (const pkg of packages) {
        // Morning slots
        slots.push({
          packageId: pkg._id,
          date: new Date(date),
          startTime: "09:00",
          endTime: "12:00",
          price: Math.floor(Math.random() * 50) + 30, // LKR 30-80
          isAvailable: Math.random() > 0.2, // 80% available
          status: Math.random() > 0.2 ? 'available' : 'blocked',
          notes: Math.random() > 0.7 ? "Setup required 30 min before" : ""
        });

        // Afternoon slots
        slots.push({
          packageId: pkg._id,
          date: new Date(date),
          startTime: "13:00",
          endTime: "16:00",
          price: Math.floor(Math.random() * 60) + 40, // LKR 40-100
          isAvailable: Math.random() > 0.3, // 70% available
          status: Math.random() > 0.3 ? 'available' : 'blocked',
          notes: ""
        });

        // Evening slots (not every day)
        if (Math.random() > 0.4) {
          slots.push({
            packageId: pkg._id,
            date: new Date(date),
            startTime: "17:00",
            endTime: "20:00",
            price: Math.floor(Math.random() * 70) + 50, // LKR 50-120
            isAvailable: Math.random() > 0.4, // 60% available
            status: Math.random() > 0.4 ? 'available' : 'blocked',
            notes: Math.random() > 0.8 ? "Extended session available" : ""
          });
        }
      }
    }

    // Insert all slots
    const createdSlots = await Slot.insertMany(slots);
    console.log(`✅ Created ${createdSlots.length} test slots`);

    // Display summary
    const slotStats = await Slot.getSlotStats();
    console.log("Slot Statistics:", slotStats);

    // Show some sample slots
    const sampleSlots = await Slot.find({})
      .populate('packageId', 'name')
      .limit(5)
      .sort({ date: 1, startTime: 1 });

    console.log("\\nSample Slots:");
    sampleSlots.forEach(slot => {
      console.log(`- ${slot.packageId.name} | ${slot.date.toDateString()} | ${slot.startTime}-${slot.endTime} | $${slot.price} | ${slot.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test slots:", error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestSlots();
}

export default createTestSlots;