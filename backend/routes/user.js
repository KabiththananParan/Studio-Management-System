import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Package from "../models/Package.js";
import { protect } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Configure Multer storage for profile photos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads", "profile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${req.user.id}-${Date.now()}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"]; 
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

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

/**
 * @route   GET /api/user/packages
 * @desc    Get all active packages for public viewing
 * @access  Public
 */
router.get("/packages", async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

/**
 * @route   POST /api/user/profile/photo
 * @desc    Upload or update profile photo
 * @access  Private
 */
router.post("/profile/photo", protect, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build public URL (served via /uploads)
    const relativePath = `/uploads/profile/${req.file.filename}`;

    // Optionally delete old file if it existed and was in our managed folder
    if (user.profilePhotoUrl && user.profilePhotoUrl.startsWith("/uploads/profile/")) {
      const oldPath = path.join(__dirname, "..", user.profilePhotoUrl.replace("/uploads/", "uploads/"));
      fs.unlink(oldPath, (err) => { if (err) /* silent */ null; });
    }

    user.profilePhotoUrl = relativePath;
    await user.save();

    const safeUser = await User.findById(req.user.id).select("-password");
    res.json({ message: "Profile photo updated", profilePhotoUrl: relativePath, user: safeUser });
  } catch (err) {
    console.error("Error uploading profile photo:", err);
    res.status(500).json({ message: "Server error" });
  }
});
