import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllRefunds,
  approveRefund,
  rejectRefund,
  processRefund,
  getRefundStats
} from "../controllers/refundController.js";

const router = express.Router();

// @route   GET /api/admin/refunds/stats
// @desc    Get refund statistics for admin dashboard
// @access  Admin
router.get("/stats", protect, admin, getRefundStats);

// @route   GET /api/admin/refunds
// @desc    Get all refund requests for admin
// @access  Admin
router.get("/", protect, admin, getAllRefunds);

// @route   PATCH /api/admin/refunds/:id/approve
// @desc    Approve refund request
// @access  Admin
router.patch("/:id/approve", protect, admin, approveRefund);

// @route   PATCH /api/admin/refunds/:id/reject
// @desc    Reject refund request
// @access  Admin
router.patch("/:id/reject", protect, admin, rejectRefund);

// @route   PATCH /api/admin/refunds/:id/process
// @desc    Process approved refund (mark as completed)
// @access  Admin
router.patch("/:id/process", protect, admin, processRefund);

export default router;