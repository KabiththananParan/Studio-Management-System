import express from 'express';
import { 
  getAdminInventoryBookings,
  getInventoryBookingDetails,
  updateInventoryBookingStatus,
  cancelInventoryBooking,
  getInventoryBookingStats,
  getOverdueBookings,
  exportInventoryBookings
} from '../controllers/adminInventoryBookingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// Get all inventory bookings with filtering and pagination
router.get('/', getAdminInventoryBookings);

// Get inventory booking statistics
router.get('/stats', getInventoryBookingStats);

// Get overdue bookings
router.get('/overdue', getOverdueBookings);

// Export inventory bookings
router.get('/export', exportInventoryBookings);

// Get single inventory booking details
router.get('/:id', getInventoryBookingDetails);

// Update inventory booking status
router.put('/:id/status', updateInventoryBookingStatus);

// Cancel inventory booking
router.put('/:id/cancel', cancelInventoryBooking);

export default router;