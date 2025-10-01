import express from "express";
import { getPublicReviews } from "../controllers/reviewController.js";

const router = express.Router();

// ========================================
// PUBLIC REVIEW ROUTES (No Auth Required)
// ========================================

// @route   GET /api/reviews/public
// @desc    Get public reviews for display on website
// @access  Public
router.get("/public", getPublicReviews);

export default router;