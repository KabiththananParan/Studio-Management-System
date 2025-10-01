import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test endpoint to debug authentication
router.get("/test-auth", protect, (req, res) => {
  console.log("=== AUTH TEST ===");
  console.log("User Object:", JSON.stringify(req.user, null, 2));
  console.log("User ID:", req.user.id);
  console.log("User Email:", req.user.email);
  console.log("User Role:", req.user.role);
  console.log("================");
  
  res.json({
    success: true,
    message: "Authentication test successful",
    user: req.user
  });
});

export default router;