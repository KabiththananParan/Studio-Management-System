import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllSlots,
  getSlotsByPackage,
  createSlot,
  updateSlot,
  deleteSlot,
  getSlotStats,
  bulkCreateSlots
} from "../controllers/slotsController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/slots/stats
// @desc    Get slot statistics for dashboard
// @access  Private/Admin
router.get("/stats", getSlotStats);

// @route   GET /api/admin/slots
// @desc    Get all slots with pagination and filtering
// @access  Private/Admin
router.get("/", getAllSlots);

// @route   GET /api/admin/slots/:packageId
// @desc    Get all slots for a specific package
// @access  Private/Admin
router.get("/:packageId", getSlotsByPackage);

// @route   POST /api/admin/slots
// @desc    Create a new slot
// @access  Private/Admin
router.post("/", createSlot);

// @route   POST /api/admin/slots/bulk
// @desc    Bulk create slots for a package
// @access  Private/Admin
router.post("/bulk", bulkCreateSlots);

// @route   PUT /api/admin/slots/:id
// @desc    Update a slot
// @access  Private/Admin
router.put("/:id", updateSlot);

// @route   DELETE /api/admin/slots/:id
// @desc    Delete a slot
// @access  Private/Admin
router.delete("/:id", deleteSlot);

export default router;