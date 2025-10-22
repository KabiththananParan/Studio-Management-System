import express from "express";
import {
  getAvailableSlotsByPackage,
  getAllAvailableSlots,
  checkSlotAvailability,
  getSlotStats,
  submitSlotRequest
} from "../controllers/userSlotsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/user/slots/stats
// @desc    Get slot statistics
// @access  Public
router.get("/stats", getSlotStats);

// @route   GET /api/user/slots/check/:slotId
// @desc    Check specific slot availability
// @access  Public
router.get("/check/:slotId", checkSlotAvailability);

// @route   GET /api/user/slots/:packageId
// @desc    Get available slots for a specific package
// @access  Public
router.get("/:packageId", getAvailableSlotsByPackage);

// @route   GET /api/user/slots
// @desc    Get all available slots (with optional filters)
// @access  Public
router.get("/", getAllAvailableSlots);

// @route   POST /api/user/slots/:packageId/request
// @desc    Submit a request when no slots are available
// @access  Protected (user)
router.post("/:packageId/request", protect, submitSlotRequest);

export default router;