import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const admin = new Admin({
      email: "admin@gmail.com",
      password: "admin123" // will be hashed by pre-save middleware
    });

    await admin.save();
    console.log("✅ Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
