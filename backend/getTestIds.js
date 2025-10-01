import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Package from "./models/Package.js";
import Slot from "./models/Slot.js";

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

const getTestIds = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: "john@gmail.com" });
    const packageDoc = await Package.findOne({});
    const slot = await Slot.findOne({ 
      packageId: packageDoc._id, 
      isAvailable: true,
      status: 'available'
    });

    console.log("Test IDs for API testing:");
    console.log("User ID:", user._id.toString());
    console.log("Package ID:", packageDoc._id.toString());
    console.log("Package Name:", packageDoc.name);
    console.log("Slot ID:", slot._id.toString());
    console.log("Slot Date:", slot.date);
    console.log("Slot Time:", slot.startTime);

    process.exit(0);
  } catch (error) {
    console.error("Error getting test IDs:", error);
    process.exit(1);
  }
};

getTestIds();