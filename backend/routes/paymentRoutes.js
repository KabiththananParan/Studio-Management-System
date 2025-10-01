import express from 'express';
import {
  processPayment,
  verifyPayment,
  getPaymentMethods,
  updatePaymentStatus
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route to verify payment routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!', timestamp: new Date() });
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', getPaymentMethods);

// @route   POST /api/payments/process
// @desc    Process payment for a booking
// @access  Private
router.post('/process', protect, processPayment);

// @route   GET /api/payments/verify/:bookingId
// @desc    Verify payment status for a booking
// @access  Private
router.get('/verify/:bookingId', protect, verifyPayment);

// @route   PUT /api/payments/admin/status/:bookingId
// @desc    Admin: Manually update payment status
// @access  Private/Admin
router.put('/admin/status/:bookingId', protect, admin, updatePaymentStatus);

export default router;