import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  addComplaintResponse,
  resolveComplaint,
  getComplaintsAnalytics,
  getComplaintsStats,
  exportComplaints,
  bulkUpdateComplaints,
  getComplaintCategories,
  deleteComplaint
} from "../controllers/adminComplaintsController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// ========================================
// ADMIN COMPLAINT ROUTES
// ========================================

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filtering, search, and pagination
// @access  Admin
router.get("/", getAllComplaints);

// @route   GET /api/admin/complaints/analytics
// @desc    Get complaints analytics and charts data
// @access  Admin
router.get("/analytics", getComplaintsAnalytics);

// @route   GET /api/admin/complaints/stats
// @desc    Get complaint statistics overview
// @access  Admin
router.get("/stats", getComplaintsStats);

// @route   GET /api/admin/complaints/categories
// @desc    Get complaint categories with counts
// @access  Admin
router.get("/categories", getComplaintCategories);

// @route   GET /api/admin/complaints/export
// @desc    Export complaints data
// @access  Admin
router.get("/export", exportComplaints);

// @route   GET /api/admin/complaints/:id
// @desc    Get specific complaint details
// @access  Admin
router.get("/:id", getComplaintById);

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin
router.put("/:id/status", updateComplaintStatus);

// @route   PUT /api/admin/complaints/:id/assign
// @desc    Assign complaint to admin
// @access  Admin
router.put("/:id/assign", assignComplaint);

// @route   POST /api/admin/complaints/:id/response
// @desc    Add response to complaint
// @access  Admin
router.post("/:id/response", addComplaintResponse);

// @route   POST /api/admin/complaints/:id/resolve
// @desc    Resolve complaint
// @access  Admin
router.post("/:id/resolve", resolveComplaint);

// @route   DELETE /api/admin/complaints/:id
// @desc    Delete complaint
// @access  Admin
router.delete("/:id", deleteComplaint);

// @route   POST /api/admin/complaints/bulk-update
// @desc    Bulk update multiple complaints
// @access  Admin
router.post("/bulk-update", bulkUpdateComplaints);

export default router;