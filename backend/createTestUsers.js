import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const createTestUsers = async () => {
  try {
    await connectDB();

    // Check if test users already exist
    const existingUser = await User.findOne({ email: "john@gmail.com" });
    if (existingUser) {
      console.log("✅ Test users already exist");
      process.exit();
      return;
    }

    const testUsers = [
      {
        firstName: "John",
        lastName: "Doe", 
        userName: "johndoe",
        email: "john@gmail.com",
        password: "password123",
        isVerified: true
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        userName: "janesmith", 
        email: "jane@gmail.com",
        password: "password123",
        isVerified: true
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        userName: "mikejohnson",
        email: "mike@gmail.com", 
        password: "password123",
        isVerified: false
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Test user created: ${user.email}`);
    }

    console.log("✅ All test users created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating test users:", err.message);
    process.exit(1);
  }
};

createTestUsers();