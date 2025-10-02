import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  deleteReview,
  addBusinessResponse,
  getReviewsAnalytics,
  getReviewsStats,
  moderateReview,
  bulkUpdateReviews,
  exportReviews
} from "../controllers/adminReviewsController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// ========================================
// ADMIN REVIEW ROUTES
// ========================================

// @route   GET /api/admin/reviews
// @desc    Get all reviews with filtering, search, and pagination
// @access  Admin
router.get("/", getAllReviews);

// @route   GET /api/admin/reviews/analytics
// @desc    Get reviews analytics and charts data
// @access  Admin
router.get("/analytics", getReviewsAnalytics);

// @route   GET /api/admin/reviews/stats
// @desc    Get review statistics overview
// @access  Admin
router.get("/stats", getReviewsStats);

// @route   GET /api/admin/reviews/export
// @desc    Export reviews data
// @access  Admin
router.get("/export", exportReviews);

// @route   GET /api/admin/reviews/:id
// @desc    Get specific review details
// @access  Admin
router.get("/:id", getReviewById);

// @route   PUT /api/admin/reviews/:id/status
// @desc    Update review status (active, hidden, flagged, deleted)
// @access  Admin
router.put("/:id/status", updateReviewStatus);

// @route   POST /api/admin/reviews/:id/response
// @desc    Add business response to review
// @access  Admin
router.post("/:id/response", addBusinessResponse);

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate review (verify, flag, add notes)
// @access  Admin
router.put("/:id/moderate", moderateReview);

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete review
// @access  Admin
router.delete("/:id", deleteReview);

// @route   POST /api/admin/reviews/bulk-update
// @desc    Bulk update multiple reviews
// @access  Admin
router.post("/bulk-update", bulkUpdateReviews);

export default router;