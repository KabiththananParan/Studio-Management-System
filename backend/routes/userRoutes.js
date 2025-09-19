import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Example protected route
router.get("/dashboard", protect, (req, res) => {
  res.status(200).json({ message: `Welcome user ${req.user.id}!` });
});

export default router;
