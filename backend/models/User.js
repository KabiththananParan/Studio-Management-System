import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String }, // Temporary OTP
  otpExpiry: { type: Date }, // Expiry time
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model("User", userSchema);
