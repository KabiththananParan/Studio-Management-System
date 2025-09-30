import express from "express";
import User from "../models/User.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // protect + admin middleware

const router = express.Router();

// Create a new user - Admin only
router.post("/", protect, admin, async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password, isVerified } = req.body;

    // Validation
    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json({ 
        message: "First name, last name, username, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { userName }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.userName === userName) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: userName.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware if you have one
      isVerified: Boolean(isVerified)
    });

    const savedUser = await user.save();
    
    // Return user without password
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      userName: savedUser.userName,
      email: savedUser.email,
      isVerified: savedUser.isVerified,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users - Admin only
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user by ID - Admin only
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a user by ID - Admin only
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password, isVerified } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check for duplicate email or username (excluding current user)
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (userName && userName !== user.userName) {
      const existingUsernameUser = await User.findOne({ 
        userName: userName, 
        _id: { $ne: req.params.id } 
      });
      if (existingUsernameUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (userName) user.userName = userName.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (password) user.password = password; // Will be hashed by pre-save middleware
    if (typeof isVerified !== "undefined") user.isVerified = isVerified;

    const updatedUser = await user.save();
    
    // Return user without password
    const userResponse = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userName: updatedUser.userName,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json(userResponse);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
