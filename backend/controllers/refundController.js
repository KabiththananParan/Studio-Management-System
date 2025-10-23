import Refund from "../models/Refund.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @desc    Create a refund request
// @route   POST /api/user/refunds
// @access  Private
export const createRefundRequest = async (req, res) => {
  try {
    const {
      bookingId,
      reason,
      reasonDescription,
      requestedAmount
    } = req.body;

    // Validate required fields
    if (!bookingId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and reason are required"
      });
    }

    // Find the booking and verify ownership
    const booking = await Booking.findById(bookingId).populate('userId', 'firstName lastName email');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user is admin first (admins can create refunds for any booking)
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    
    if (!isAdmin) {
      // For non-admin users, verify ownership of the booking
      let isAuthorized = false;
      
      if (booking.userId) {
        // For registered user bookings - check user ID match (handle populated vs non-populated)
        const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
        const requestUserId = req.user.id.toString();
        isAuthorized = bookingUserId === requestUserId;
      } else {
        // For guest bookings - check email match
        isAuthorized = booking.customerInfo.email === req.user.email;
      }
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to request refund for this booking"
        });
      }
    }

    // Check if booking is eligible for refund
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Cannot request refund for cancelled booking"
      });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot request refund for unpaid booking"
      });
    }

    // Check if refund already exists for this booking
    const existingRefund = await Refund.findOne({ bookingId });
    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: "Refund request already exists for this booking",
        refund: {
          refundNumber: existingRefund.refundNumber,
          status: existingRefund.status
        }
      });
    }

    // Calculate refund amount (use requested amount or full booking amount)
    const refundAmount = requestedAmount || booking.totalAmount;
    
    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount"
      });
    }

    // Get user info for customer details
    const user = await User.findById(req.user.id);

    // Generate refund number
    const refundNumber = await Refund.generateRefundNumber();

    // Create refund request
    const refund = new Refund({
      bookingId,
      userId: req.user.id,
      refundNumber,
      requestedAmount: refundAmount,
      reason,
      reasonDescription: reasonDescription || '',
      customerInfo: {
        name: booking.customerInfo.name || `${user.firstName} ${user.lastName}`,
        email: booking.customerInfo.email || user.email,
        phone: booking.customerInfo.phone || user.phone
      },
      originalTransactionId: booking.paymentId || booking._id.toString(),
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        refundPolicy: 'Standard refund policy applies'
      }
    });

    await refund.save();

    // Update booking payment status to indicate refund requested
    booking.paymentStatus = 'refund_requested';
    await booking.save();
    
    console.log(`Booking ${booking._id} status updated: paymentStatus='refund_requested'`);

    // Populate the refund with related data
    const populatedRefund = await Refund.findById(refund._id)
      .populate('bookingId', 'customerInfo totalAmount bookingStatus paymentStatus package')
      .populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: "Refund request created successfully",
      refund: {
        _id: populatedRefund._id,
        refundNumber: populatedRefund.refundNumber,
        bookingId: populatedRefund.bookingId._id,
        requestedAmount: populatedRefund.requestedAmount,
        status: populatedRefund.status,
        reason: populatedRefund.reason,
        reasonDescription: populatedRefund.reasonDescription,
        requestDate: populatedRefund.requestDate,
        customerInfo: populatedRefund.customerInfo,
        booking: {
          customerName: populatedRefund.bookingId.customerInfo.name,
          totalAmount: populatedRefund.bookingId.totalAmount,
          package: populatedRefund.bookingId.package
        }
      }
    });
  } catch (error) {
    console.error("Error creating refund request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get user's refund requests
// @route   GET /api/user/refunds
// @access  Private
export const getUserRefunds = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'requestDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { userId: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get refunds with pagination
    const refunds = await Refund.find(filter)
      .populate({
        path: 'bookingId',
        select: 'customerInfo totalAmount bookingStatus paymentStatus package slot',
        populate: {
          path: 'packageId',
          select: 'name price description'
        }
      })
      .populate('userId', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRefunds = await Refund.countDocuments(filter);
    const totalPages = Math.ceil(totalRefunds / parseInt(limit));

    // Get refund statistics for the user
    const stats = await Refund.getRefundStats(req.user.id);

    // Format refunds for response
    const formattedRefunds = refunds.map(refund => ({
      _id: refund._id,
      refundNumber: refund.refundNumber,
      bookingId: refund.bookingId._id,
      requestedAmount: refund.requestedAmount,
      approvedAmount: refund.approvedAmount,
      refundFee: refund.refundFee,
      netRefundAmount: refund.calculateRefundAmount(),
      status: refund.status,
      reason: refund.reason,
      reasonDescription: refund.reasonDescription,
      refundMethod: refund.refundMethod,
      requestDate: refund.requestDate,
      approvedDate: refund.approvedDate,
      processedDate: refund.processedDate,
      completedDate: refund.completedDate,
      customerInfo: refund.customerInfo,
      booking: refund.bookingId ? {
        customerName: refund.bookingId.customerInfo?.name,
        totalAmount: refund.bookingId.totalAmount,
        bookingStatus: refund.bookingId.bookingStatus,
        paymentStatus: refund.bookingId.paymentStatus,
        package: refund.bookingId.packageId,
        slot: refund.bookingId.slot
      } : null,
      canBeCancelled: refund.canBeCancelled()
    }));

    res.json({
      success: true,
      refunds: formattedRefunds,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRefunds,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats
    });
  } catch (error) {
    console.error("Error fetching user refunds:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get refund details by ID
// @route   GET /api/user/refunds/:id
// @access  Private
export const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findById(id)
      .populate({
        path: 'bookingId',
        select: 'customerInfo totalAmount bookingStatus paymentStatus package slot duration',
        populate: {
          path: 'packageId',
          select: 'name price description features'
        }
      })
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName email');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }

    // Verify the user owns this refund - handle populated vs non-populated user
    const refundUserId = refund.userId._id ? refund.userId._id.toString() : refund.userId.toString();
    const isOwner = refundUserId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this refund"
      });
    }

    res.json({
      success: true,
      refund: {
        _id: refund._id,
        refundNumber: refund.refundNumber,
        bookingId: refund.bookingId._id,
        requestedAmount: refund.requestedAmount,
        approvedAmount: refund.approvedAmount,
        refundFee: refund.refundFee,
        netRefundAmount: refund.calculateRefundAmount(),
        status: refund.status,
        reason: refund.reason,
        reasonDescription: refund.reasonDescription,
        adminNotes: refund.adminNotes,
        refundMethod: refund.refundMethod,
        requestDate: refund.requestDate,
        approvedDate: refund.approvedDate,
        processedDate: refund.processedDate,
        completedDate: refund.completedDate,
        originalTransactionId: refund.originalTransactionId,
        refundTransactionId: refund.refundTransactionId,
        customerInfo: refund.customerInfo,
        booking: refund.bookingId,
        processedBy: refund.processedBy,
        canBeCancelled: refund.canBeCancelled()
      }
    });
  } catch (error) {
    console.error("Error fetching refund details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Cancel refund request
// @route   PATCH /api/user/refunds/:id/cancel
// @access  Private
export const cancelRefundRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findById(id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }

    // Verify the user owns this refund
    if (refund.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this refund"
      });
    }

    // Check if refund can be cancelled
    if (!refund.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel refund with status: ${refund.status}`
      });
    }

    // Update refund status
    refund.status = 'cancelled';
    await refund.save();

    res.json({
      success: true,
      message: "Refund request cancelled successfully",
      refund: {
        _id: refund._id,
        refundNumber: refund.refundNumber,
        status: refund.status
      }
    });
  } catch (error) {
    console.error("Error cancelling refund request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get refund eligibility for a booking
// @route   GET /api/user/bookings/:bookingId/refund-eligibility
// @access  Private
export const getRefundEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Authorization will be checked below

    // Check if user is admin first (admins can check any booking)
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    
    if (!isAdmin) {
      // For non-admin users, verify ownership of the booking
      let isAuthorized = false;
      
      if (booking.userId) {
        // For registered user bookings - check user ID match
        const bookingUserId = booking.userId.toString();
        const requestUserId = req.user.id.toString();
        isAuthorized = bookingUserId === requestUserId;
        
        // IDs are now properly compared as strings
      } else {
        // For guest bookings - check email match
        isAuthorized = booking.customerInfo.email === req.user.email;
      }
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to check refund eligibility for this booking"
        });
      }
    }

    // Check existing refund
    const existingRefund = await Refund.findOne({ bookingId });

    // Determine eligibility
    let eligible = true;
    let reason = '';
    let maxRefundAmount = 0;

    if (booking.bookingStatus === 'cancelled') {
      eligible = false;
      reason = 'Booking is already cancelled';
    } else if (booking.paymentStatus !== 'completed') {
      eligible = false;
      reason = 'Booking payment is not completed';
    } else if (existingRefund) {
      eligible = false;
      reason = 'Refund request already exists';
    } else {
      // Calculate refund amount based on booking date and policy
      const bookingDate = new Date(booking.bookingDate);
      const currentDate = new Date();
      const daysUntilBooking = Math.ceil((bookingDate - currentDate) / (1000 * 60 * 60 * 24));
      
      // Refund policy: 
      // - More than 7 days: 100% refund
      // - 3-7 days: 75% refund
      // - 1-2 days: 50% refund
      // - Same day or past: No refund
      
      if (daysUntilBooking < 0) {
        eligible = false;
        reason = 'Cannot refund past bookings';
      } else if (daysUntilBooking === 0) {
        eligible = false;
        reason = 'Cannot refund same-day bookings';
      } else if (daysUntilBooking <= 2) {
        maxRefundAmount = booking.totalAmount * 0.5;
      } else if (daysUntilBooking <= 7) {
        maxRefundAmount = booking.totalAmount * 0.75;
      } else {
        maxRefundAmount = booking.totalAmount;
      }
    }

    res.json({
      success: true,
      eligibility: {
        eligible,
        reason: eligible ? 'Eligible for refund' : reason,
        maxRefundAmount: eligible ? maxRefundAmount : 0,
        refundPercentage: eligible ? Math.round((maxRefundAmount / booking.totalAmount) * 100) : 0,
        existingRefund: existingRefund ? {
          refundNumber: existingRefund.refundNumber,
          status: existingRefund.status,
          requestedAmount: existingRefund.requestedAmount
        } : null,
        booking: {
          totalAmount: booking.totalAmount,
          bookingDate: booking.bookingDate,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus
        }
      }
    });
  } catch (error) {
    console.error("Error checking refund eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ========================================
// ADMIN REFUND MANAGEMENT FUNCTIONS
// ========================================

// @desc    Get all refund requests for admin
// @route   GET /api/admin/refunds
// @access  Admin
export const getAllRefunds = async (req, res) => {
  try {
    const { 
      status = 'all', 
      page = 1, 
      limit = 10,
      sortBy = 'requestDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get refunds with population
    const refunds = await Refund.find(filter)
      .populate('userId', 'name email')
      .populate('bookingId', 'packageName bookingDate totalAmount customerInfo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRefunds = await Refund.countDocuments(filter);
    const totalPages = Math.ceil(totalRefunds / limit);

    // Get summary statistics
    const stats = await Refund.getRefundStats();

    res.json({
      success: true,
      refunds,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRefunds,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats
    });
  } catch (error) {
    console.error("Error fetching all refunds:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Approve refund request
// @route   PATCH /api/admin/refunds/:id/approve
// @access  Admin
export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedAmount, adminNotes } = req.body;

    console.log(`ADMIN APPROVE - admin=${req.user?.id} refundId=${id} body=`, req.body);
    const refund = await Refund.findById(id).populate('bookingId userId');
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found"
      });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending refund requests can be approved"
      });
    }

    // Normalize and validate approved amount
    const parsedApproved = (approvedAmount === undefined || approvedAmount === null)
      ? refund.requestedAmount
      : Number(approvedAmount);

    if (Number.isNaN(parsedApproved)) {
      console.log('ADMIN APPROVE - invalid approvedAmount:', approvedAmount);
      return res.status(400).json({
        success: false,
        message: "Invalid approvedAmount provided"
      });
    }

    if (parsedApproved > refund.requestedAmount) {
      console.log('ADMIN APPROVE - approvedAmount exceeds requested:', parsedApproved, '>', refund.requestedAmount);
      return res.status(400).json({
        success: false,
        message: "Approved amount cannot exceed requested amount"
      });
    }

    // Update refund status
  refund.status = 'approved';
  refund.approvedAmount = parsedApproved;
  refund.adminNotes = (adminNotes || '') + ' [DEMO MODE - No actual money transfer]';
    refund.approvedDate = new Date();
    refund.processedBy = req.user.id;

    await refund.save();

    // Update booking status when refund is approved
    if (refund.bookingId) {
      // Update payment status to indicate refund approved
      refund.bookingId.paymentStatus = 'refund_approved';
      // Update booking status to reflect the refund
      refund.bookingId.bookingStatus = 'refunded';
      await refund.bookingId.save();
      
      console.log(`Booking ${refund.bookingId._id} status updated: paymentStatus='refund_approved', bookingStatus='refunded'`);
    }

    const respRefund = await Refund.findById(id)
      .populate('userId', 'name email')
      .populate('bookingId', 'packageName bookingDate totalAmount');

    res.json({
      success: true,
      demo: true,
      message: "Refund request approved successfully",
      refund: respRefund
    });
  } catch (error) {
    console.error("Error approving refund:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Reject refund request
// @route   PATCH /api/admin/refunds/:id/reject
// @access  Admin
export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const refund = await Refund.findById(id);
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found"
      });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending refund requests can be rejected"
      });
    }

    // Update refund status
    refund.status = 'rejected';
    refund.adminNotes = adminNotes || "Refund request rejected by admin";
    refund.processedDate = new Date();
    refund.processedBy = req.user.id;

    await refund.save();

    res.json({
      success: true,
      message: "Refund request rejected",
      refund: await Refund.findById(id)
        .populate('userId', 'name email')
        .populate('bookingId', 'packageName bookingDate totalAmount')
    });
  } catch (error) {
    console.error("Error rejecting refund:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Process approved refund (mark as completed)
// @route   PATCH /api/admin/refunds/:id/process
// @access  Admin
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundTransactionId, adminNotes } = req.body;

    const refund = await Refund.findById(id).populate('bookingId');
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found"
      });
    }

    if (refund.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: "Only approved refund requests can be processed"
      });
    }

    // Update refund status
    refund.status = 'completed';
    refund.refundTransactionId = refundTransactionId || 'DEMO-' + Date.now(); // Demo transaction ID
    refund.adminNotes = (adminNotes || refund.adminNotes) + ' [DEMO COMPLETED - No actual payment processed]';
    refund.completedDate = new Date();
    refund.processedBy = req.user.id;

    await refund.save();

    // Update booking final status when refund is completed
    if (refund.bookingId) {
      refund.bookingId.paymentStatus = 'refunded';
      await refund.bookingId.save();
      
      console.log(`Booking ${refund.bookingId._id} final status updated: paymentStatus='refunded'`);
    }

    res.json({
      success: true,
      message: "Refund processed successfully (DEMO MODE - No actual money transfer)",
      demo: true,
      refund: await Refund.findById(id)
        .populate('userId', 'name email')
        .populate('bookingId', 'packageName bookingDate totalAmount')
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get refund statistics for admin dashboard
// @route   GET /api/admin/refunds/stats
// @access  Admin
export const getRefundStats = async (req, res) => {
  try {
    const stats = await Refund.getRefundStats();
    
    // Get recent refund activity
    const recentRefunds = await Refund.find()
      .populate('userId', 'name email')
      .populate('bookingId', 'packageName bookingDate')
      .sort({ requestDate: -1 })
      .limit(10);

    res.json({
      success: true,
      stats,
      recentActivity: recentRefunds
    });
  } catch (error) {
    console.error("Error getting refund stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};