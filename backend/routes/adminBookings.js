import express from 'express';
import {
  getAllBookings,
  createBookingAsAdmin,
  updateBookingAsAdmin,
  deleteBookingAsAdmin,
  getBookingStats
} from '../controllers/adminBookingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, admin);

// @route   GET /api/admin/bookings/stats
// @desc    Get booking statistics
// @access  Private/Admin
router.get('/stats', getBookingStats);

// @route   GET /api/admin/bookings
// @desc    Get all bookings with pagination and filters
// @access  Private/Admin
router.get('/', getAllBookings);

// @route   POST /api/admin/bookings
// @desc    Create new booking as admin
// @access  Private/Admin
router.post('/', createBookingAsAdmin);

// @route   PUT /api/admin/bookings/:id
// @desc    Update booking as admin
// @access  Private/Admin
router.put('/:id', updateBookingAsAdmin);

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete booking as admin
// @access  Private/Admin
router.delete('/:id', deleteBookingAsAdmin);

export default router;