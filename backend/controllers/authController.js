import User from "../models/User.js";
import LoginLog from "../models/LoginLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email transporter (used in register)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📌 Register User & Send OTP
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, userName, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) return res.status(400).json({ message: "Email or username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.create({
      firstName,
      lastName,
      email,
      userName,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    });

    res.status(201).json({ message: "User registered. OTP will be sent to email." });

    // Send OTP email
    try {
      const mailOptions = {
        from: `"Studio Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification Code",
        text: `Your verification code is ${otp}`,
        html: `<h2>Your OTP is: <b>${otp}</b></h2>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email} | MessageId: ${info.messageId}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
    }

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 📌 Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Email verified successfully", token });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 📌 Login User & Log to MongoDB
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ Save login info to MongoDB
    await LoginLog.create({ userEmail: user.email });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, name: user.firstName + " " + user.lastName }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
