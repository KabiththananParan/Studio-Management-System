import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  loginAt: { type: Date, default: Date.now }
});

const LoginLog = mongoose.model("LoginLog", loginLogSchema);

export default LoginLog;
