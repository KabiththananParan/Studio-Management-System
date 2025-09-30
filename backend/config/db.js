import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB Connection Failed ❌", err.message);
    console.log("Server will continue running without database connection...");
    // Don't exit the process, let the server continue running
    // This allows the API to respond with appropriate error messages
  }
};

export default connectDB;
