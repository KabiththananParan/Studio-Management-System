import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import User from "./models/User.js";

const testEmailVerificationFlow = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find a test user
    let testUser = await User.findOne({ email: "test@example.com" });
    
    if (!testUser) {
      // Create a test user if none exists
      testUser = await User.create({
        firstName: "Test",
        lastName: "User", 
        email: "test@example.com",
        userName: "testuser123",
        password: "testpass123",
        isVerified: false,
        otp: "123456",
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      });
      console.log("✅ Created test user with OTP: 123456");
    } else {
      // Update existing user with new OTP
      testUser.otp = "123456";
      testUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      testUser.isVerified = false;
      await testUser.save();
      console.log("✅ Updated test user with OTP: 123456");
    }

    console.log("\n📧 Test Email Verification Flow:");
    console.log("1. Use email: test@example.com");
    console.log("2. Use OTP: 123456");
    console.log("3. User should be redirected to login after verification");
    
    console.log("\n🔍 User details:");
    console.log(`- Email: ${testUser.email}`);
    console.log(`- Username: ${testUser.userName}`);
    console.log(`- Verified: ${testUser.isVerified}`);
    console.log(`- OTP: ${testUser.otp}`);
    console.log(`- OTP Expires: ${testUser.otpExpiry}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testEmailVerificationFlow();