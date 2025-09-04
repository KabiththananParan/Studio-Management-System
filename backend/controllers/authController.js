import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Email transporter (Gmail example, replace with your SMTP)
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      userName,
      password: hashedPassword,
      otp,
      otpExpiry
    });

    // Send email
    await transporter.sendMail({
      from: `"Studio Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is ${otp}`,
      html: `<h2>Your OTP is: <b>${otp}</b></h2>`
    });

    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ message: "Email verified successfully", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
