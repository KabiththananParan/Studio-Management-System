import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const fixExistingUsers = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`\nProcessing user: ${user.email}`);
      
      // Check if password is double-hashed by trying to verify a common test password
      const testPasswords = ["123456", "password", "123123", user.firstName.toLowerCase()];
      
      let passwordFound = false;
      for (const testPassword of testPasswords) {
        // Try direct comparison (if password is already properly hashed)
        const directMatch = await bcrypt.compare(testPassword, user.password);
        if (directMatch) {
          console.log(`✅ Password "${testPassword}" works for ${user.email}`);
          passwordFound = true;
          break;
        }
      }

      if (!passwordFound) {
        console.log(`❌ No test password worked for ${user.email}`);
        console.log(`Current password hash: ${user.password}`);
        
        // This user likely has a double-hashed password
        // Let's reset it to a known password for testing
        console.log(`🔄 Resetting password to "123456" for ${user.email}`);
        
        // Update password directly (this will trigger the pre-save hook)
        user.password = "123456";
        await user.save();
        
        console.log(`✅ Password reset for ${user.email}`);
      }
    }

    console.log("\n✅ All users processed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixExistingUsers();