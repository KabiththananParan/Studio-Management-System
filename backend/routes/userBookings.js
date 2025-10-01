import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updatePaymentStatus
} from "../controllers/userBookingsController.js";

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

export default router;