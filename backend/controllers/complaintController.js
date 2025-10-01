import Complaint from '../models/Complaint.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, bookingId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Get user information
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare complaint data
    const complaintData = {
      userId,
      userInfo: {
        name: user.name || 'Unknown User',
        email: user.email || 'no-email@example.com'
      },
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium'
    };

    // If booking reference is provided, validate and add booking info
    if (bookingId) {
      const booking = await Booking.findOne({ 
        _id: bookingId, 
        userId: userId 
      }).select('packageName bookingDate totalAmount');
      
      if (booking) {
        complaintData.bookingId = bookingId;
        complaintData.bookingInfo = {
          packageName: booking.packageName,
          bookingDate: booking.bookingDate,
          amount: booking.totalAmount
        };
      }
    }

    // Create complaint
    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        _id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        bookingInfo: complaint.bookingInfo,
        createdAt: complaint.createdAt,
        canEdit: complaint.canBeEditedBy(userId),
        canDelete: complaint.canBeDeletedBy(userId)
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

// Get user's complaints
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const complaints = await Complaint.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('bookingId', 'packageName bookingDate totalAmount')
      .select('-adminResponse -resolution.resolvedBy -lastUpdatedBy -assignedTo');

    // Get total count for pagination
    const totalComplaints = await Complaint.countDocuments(filter);

    // Add permission flags to each complaint
    const complaintsWithPermissions = complaints.map(complaint => ({
      ...complaint.toObject(),
      canEdit: complaint.canBeEditedBy(userId),
      canDelete: complaint.canBeDeletedBy(userId),
      ageInDays: complaint.ageInDays
    }));

    // Get user statistics
    const stats = await Complaint.getUserStats(userId);

    res.json({
      success: true,
      complaints: complaintsWithPermissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComplaints / limit),
        totalComplaints,
        hasNext: page < Math.ceil(totalComplaints / limit),
        hasPrev: page > 1
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get single complaint details
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const complaint = await Complaint.findOne({ _id: id, userId })
      .populate('bookingId', 'packageName bookingDate totalAmount bookingStatus paymentStatus')
      .populate('adminResponse.respondedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add permission flags
    const complaintWithPermissions = {
      ...complaint.toObject(),
      canEdit: complaint.canBeEditedBy(userId),
      canDelete: complaint.canBeDeletedBy(userId),
      ageInDays: complaint.ageInDays
    };

    res.json({
      success: true,
      complaint: complaintWithPermissions
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
};

// Update complaint
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority } = req.body;
    const userId = req.user.id;

    // Find complaint
    const complaint = await Complaint.findOne({ _id: id, userId });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user can edit
    if (!complaint.canBeEditedBy(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit pending complaints within 24 hours of creation'
      });
    }

    // Validate fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Update complaint
    complaint.title = title.trim();
    complaint.description = description.trim();
    complaint.category = category;
    if (priority) complaint.priority = priority;

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: {
        _id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        bookingInfo: complaint.bookingInfo,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        canEdit: complaint.canBeEditedBy(userId),
        canDelete: complaint.canBeDeletedBy(userId)
      }
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: error.message
    });
  }
};

// Delete complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find complaint
    const complaint = await Complaint.findOne({ _id: id, userId });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user can delete
    if (!complaint.canBeDeletedBy(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete pending complaints within 1 hour of creation'
      });
    }

    await Complaint.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message
    });
  }
};

// Get complaint categories and their descriptions
export const getComplaintCategories = async (req, res) => {
  try {
    const categories = [
      {
        value: 'service_quality',
        label: 'Service Quality',
        description: 'Issues with the quality of photography services, final photos, or deliverables'
      },
      {
        value: 'staff_behavior',
        label: 'Staff Behavior',
        description: 'Concerns about staff conduct, professionalism, or customer service'
      },
      {
        value: 'billing_payment',
        label: 'Billing & Payment',
        description: 'Issues with pricing, invoices, payment processing, or refunds'
      },
      {
        value: 'booking_process',
        label: 'Booking Process',
        description: 'Problems with booking system, scheduling, or reservation management'
      },
      {
        value: 'facility_equipment',
        label: 'Facility & Equipment',
        description: 'Issues with studio facilities, equipment, or technical problems'
      },
      {
        value: 'communication',
        label: 'Communication',
        description: 'Problems with information sharing, updates, or response times'
      },
      {
        value: 'delivery_timing',
        label: 'Delivery & Timing',
        description: 'Issues with delivery schedules, delays, or timing of services'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Any other concerns not covered by the above categories'
      }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get user's bookings for complaint reference
export const getUserBookingsForComplaint = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get completed bookings that could be referenced in complaints
    const bookings = await Booking.find({
      userId,
      $or: [
        { bookingStatus: 'completed' },
        { paymentStatus: 'completed' },
        { bookingStatus: 'cancelled' } // Can complain about cancellation issues
      ]
    })
    .select('_id packageName bookingDate totalAmount bookingStatus paymentStatus')
    .sort({ bookingDate: -1 })
    .limit(20); // Limit to recent 20 bookings

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking._id,
        packageName: booking.packageName,
        bookingDate: booking.bookingDate,
        totalAmount: booking.totalAmount,
        status: `${booking.bookingStatus} | ${booking.paymentStatus}`,
        displayText: `${booking.packageName} - ${new Date(booking.bookingDate).toLocaleDateString()} (LKR ${booking.totalAmount?.toLocaleString()})`
      }))
    });
  } catch (error) {
    console.error('Error fetching bookings for complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

export default {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintCategories,
  getUserBookingsForComplaint
};