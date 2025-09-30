import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifyOtp, 
  forgotPassword, 
  verifyResetOtp, 
  resetPassword,
  verifyToken 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

// Token verification route
router.get("/verify", verifyToken);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;