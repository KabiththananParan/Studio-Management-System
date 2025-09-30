import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    // Add these fields for password reset
    resetPasswordOtp: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);