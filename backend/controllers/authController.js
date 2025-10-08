import User from "../models/User.js";
import LoginLog from "../models/LoginLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email transporter (corrected method name)
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

    // Remove manual hashing - User model pre-save hook will handle it
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.create({
      firstName,
      lastName,
      email,
      userName,
      password, // Let the pre-save hook handle hashing
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

// 📌 Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    res.status(200).json({ message: "New OTP sent to your email." });

    // Send new OTP email
    try {
      const mailOptions = {
        from: `"Studio Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification Code - Resent",
        text: `Your new verification code is ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Email Verification</h2>
            <p>You requested a new verification code for your Studio Manager account.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; font-size: 24px; color: #1f2937;">Your Verification Code:</h3>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 10px 0;">${otp}</div>
              <p style="margin: 0; color: #6b7280;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Resent OTP email to ${email}`);
    } catch (emailErr) {
      console.error("Failed to send resend OTP email:", emailErr);
    }

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
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

// 📌 Forgot Password - Send Reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset OTP has been sent." 
      });
    }

    // Generate reset OTP
    const resetOtp = generateOTP();
    const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset OTP to user
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    // Send reset OTP email
    try {
      const mailOptions = {
        from: `"Studio Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Code",
        text: `Your password reset code is ${resetOtp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested a password reset for your Studio Manager account.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; font-size: 24px; color: #1f2937;">Your Reset Code:</h3>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 10px 0;">${resetOtp}</div>
              <p style="margin: 0; color: #6b7280;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this reset, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset OTP sent to ${email}`);
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      // Don't reveal email sending failure for security
    }

    res.status(200).json({ 
      message: "If an account with that email exists, a password reset OTP has been sent." 
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// 📌 Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid, generate a temporary token for password reset
    const resetToken = jwt.sign(
      { id: user._id, purpose: "password-reset" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "15m" }
    );

    res.status(200).json({ 
      message: "OTP verified successfully", 
      resetToken 
    });

  } catch (err) {
    console.error("Verify reset OTP error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// 📌 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update password - let pre-save hook handle hashing
    user.password = newPassword;
    
    // Clear reset fields
    user.resetPasswordOtp = null;
    user.resetPasswordExpiry = null;
    
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// 📌 Verify Token
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Token is valid", 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.firstName + " " + user.lastName 
      } 
    });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    console.error("Token verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
