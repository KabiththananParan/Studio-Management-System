import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updatePaymentStatus,
  updateBooking,
  deleteBooking
} from "../controllers/userBookingsController.js";
import { getRefundEligibility } from "../controllers/refundController.js";
import { checkReviewEligibility } from "../controllers/reviewController.js";

const router = express.Router();

// @route   POST /api/user/bookings
// @desc    Create a new booking
// @access  Private
router.post("/", protect, createBooking);

// @route   GET /api/user/bookings
// @desc    Get user's bookings
// @access  Private
router.get("/", protect, getUserBookings);

// @route   GET /api/user/bookings/:id
// @desc    Get specific booking details
// @access  Private
router.get("/:id", protect, getBookingById);

// @route   PATCH /api/user/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.patch("/:id/cancel", protect, cancelBooking);

// @route   PATCH /api/user/bookings/:id/payment
// @desc    Update payment status
// @access  Private
router.patch("/:id/payment", protect, updatePaymentStatus);

// @route   PUT /api/user/bookings/:id
// @desc    Update booking details
// @access  Private
router.put("/:id", protect, updateBooking);

// @route   DELETE /api/user/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete("/:id", protect, deleteBooking);

// @route   GET /api/user/bookings/:bookingId/refund-eligibility
// @desc    Check refund eligibility for a booking
// @access  Private
router.get("/:bookingId/refund-eligibility", protect, getRefundEligibility);

// @route   GET /api/user/bookings/:bookingId/review-eligibility
// @desc    Check review eligibility for a booking
// @access  Private
router.get("/:bookingId/review-eligibility", protect, checkReviewEligibility);

export default router;