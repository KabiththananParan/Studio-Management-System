import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRefundRequest,
  getUserRefunds,
  getRefundById,
  cancelRefundRequest,
  getRefundEligibility
} from "../controllers/refundController.js";

const router = express.Router();

// @route   POST /api/user/refunds
// @desc    Create a refund request
// @access  Private
router.post("/", protect, createRefundRequest);

// @route   GET /api/user/refunds
// @desc    Get user's refund requests
// @access  Private
router.get("/", protect, getUserRefunds);

// @route   GET /api/user/refunds/:id
// @desc    Get specific refund details
// @access  Private
router.get("/:id", protect, getRefundById);

// @route   PATCH /api/user/refunds/:id/cancel
// @desc    Cancel refund request
// @access  Private
router.patch("/:id/cancel", protect, cancelRefundRequest);

// @route   GET /api/refunds/eligibility/:bookingId
// @desc    Check refund eligibility for a booking
// @access  Private
router.get("/eligibility/:bookingId", protect, getRefundEligibility);

export default router;