import express from 'express';
import {
  getUserInventoryBookings,
  getInventoryBookingById,
  getAvailableInventory,
  checkAvailability,
  createInventoryBooking,
  updateInventoryBooking,
  cancelInventoryBooking,
  getUserBookingStats
} from '../controllers/inventoryBookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Test route without auth for debugging
router.get('/test-available', async (req, res) => {
  try {
    const items = await Inventory.find({
      status: 'Available',
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    }).select('name brand model rental.dailyRate').limit(5);
    
    res.json({
      success: true,
      message: 'Test route working',
      count: items.length,
      items: items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply authentication middleware to all other routes
router.use(protect);

// User inventory booking routes
router.get('/stats', getUserBookingStats);
router.get('/available', getAvailableInventory);
router.post('/check-availability', checkAvailability);

router.route('/')
  .get(getUserInventoryBookings)
  .post(createInventoryBooking);

router.route('/:id')
  .get(getInventoryBookingById)
  .put(updateInventoryBooking);

router.put('/:id/cancel', cancelInventoryBooking);

export default router;