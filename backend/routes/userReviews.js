import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  checkReviewEligibility,
  getPublicReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// ========================================
// USER REVIEW ROUTES (Private)
// ========================================

// @route   POST /api/user/reviews
// @desc    Create a new review
// @access  Private
router.post("/", protect, createReview);

// @route   GET /api/user/reviews
// @desc    Get user's reviews with pagination and filtering
// @access  Private
router.get("/", protect, getUserReviews);

// @route   GET /api/user/reviews/:id
// @desc    Get specific review details
// @access  Private
router.get("/:id", protect, getReviewById);

// @route   PUT /api/user/reviews/:id
// @desc    Update review (within 24 hours)
// @access  Private
router.put("/:id", protect, updateReview);

// @route   DELETE /api/user/reviews/:id
// @desc    Delete review
// @access  Private
router.delete("/:id", protect, deleteReview);

export default router;