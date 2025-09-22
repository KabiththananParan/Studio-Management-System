import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * @route   GET /api/user/me
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/user/update
 * @desc    Update user profile
 * @access  Private
 */
router.put("/update", protect, async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;

    let updateData = { firstName, lastName, userName, email };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/user/delete
 * @desc    Delete account
 * @access  Private
 */
router.delete("/delete", protect, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
