import express from 'express';
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintCategories,
  getUserBookingsForComplaint
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get complaint categories
router.get('/categories', getComplaintCategories);

// Get user's bookings for complaint reference
router.get('/bookings', getUserBookingsForComplaint);

// Create new complaint
router.post('/', createComplaint);

// Get user's complaints
router.get('/', getUserComplaints);

// Get specific complaint
router.get('/:id', getComplaintById);

// Update complaint
router.put('/:id', updateComplaint);

// Delete complaint
router.delete('/:id', deleteComplaint);

export default router;