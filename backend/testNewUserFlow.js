import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const testNewUserFlow = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Delete test user if exists
    await User.deleteOne({ email: "test@example.com" });
    console.log("Cleaned up any existing test user");

    // Create a new user with the fixed registration process
    console.log("Creating new test user...");
    const newUser = await User.create({
      firstName: "Test",
      lastName: "User", 
      email: "test@example.com",
      userName: "testuser",
      password: "testpass", // This will be hashed by pre-save hook
      isVerified: true
    });

    console.log("✅ New user created:", newUser.email);
    console.log("Password hash:", newUser.password);

    // Now test if we can login with this user
    console.log("\nTesting password verification...");
    const testPassword = "testpass";
    const isMatch = await bcrypt.compare(testPassword, newUser.password);
    
    if (isMatch) {
      console.log("✅ Password verification successful!");
      console.log("The signup-login flow should now work correctly.");
    } else {
      console.log("❌ Password verification failed!");
    }

    // Clean up
    await User.deleteOne({ email: "test@example.com" });
    console.log("Test user cleaned up.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testNewUserFlow();