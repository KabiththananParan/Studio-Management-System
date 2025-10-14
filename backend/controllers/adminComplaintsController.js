import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// ========================================
// GET ALL COMPLAINTS WITH FILTERING & SEARCH
// ========================================
export const getAllComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query filters
    let filters = {};

    // Text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filters.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'userInfo.name': searchRegex },
        { 'userInfo.email': searchRegex },
        { tags: searchRegex }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filters.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      filters.category = category;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      filters.priority = priority;
    }

    // Assigned to filter
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        filters.assignedTo = { $exists: false };
      } else {
        filters.assignedTo = assignedTo;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) {
        filters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [complaints, totalComplaints] = await Promise.all([
      Complaint.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'firstName lastName email isVerified')
        .populate('bookingId', 'packageName bookingDate totalAmount')
        .populate('assignedTo', 'firstName lastName')
        .populate('adminResponse.respondedBy', 'firstName lastName')
        .populate('resolution.resolvedBy', 'firstName lastName')
        .populate('lastUpdatedBy', 'firstName lastName')
        .lean(),
      Complaint.countDocuments(filters)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalComplaints / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalComplaints,
          hasNext,
          hasPrev,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// ========================================
// GET COMPLAINTS ANALYTICS
// ========================================
export const getComplaintsAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case '1y':
        dateFilter.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    // Status distribution
    const statusDistribution = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Category breakdown
    const categoryBreakdown = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgResolutionDays: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'resolved'] },
                {
                  $divide: [
                    { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                    1000 * 60 * 60 * 24
                  ]
                },
                null
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Priority distribution
    const priorityDistribution = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Complaints over time
    const complaintsOverTime = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Resolution time analytics
    const resolutionTimeStats = await Complaint.aggregate([
      { 
        $match: { 
          status: 'resolved',
          'resolution.resolvedAt': { $exists: true },
          ...dateFilter
        }
      },
      {
        $project: {
          resolutionDays: {
            $divide: [
              { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionDays' },
          minResolutionTime: { $min: '$resolutionDays' },
          maxResolutionTime: { $max: '$resolutionDays' },
          totalResolved: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution,
        categoryBreakdown,
        priorityDistribution,
        complaintsOverTime,
        resolutionStats: resolutionTimeStats[0] || {
          avgResolutionTime: 0,
          minResolutionTime: 0,
          maxResolutionTime: 0,
          totalResolved: 0
        }
      }
    });

  } catch (error) {
    console.error('Complaints analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints analytics',
      error: error.message
    });
  }
};

// ========================================
// GET COMPLAINTS STATS
// ========================================
export const getComplaintsStats = async (req, res) => {
  try {
    const [
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      inProgressComplaints,
      recentComplaints,
      avgResolutionTime
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Complaint.aggregate([
        { $match: { status: 'resolved', 'resolution.resolvedAt': { $exists: true } } },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: {
                $divide: [
                  { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        }
      ])
    ]);

    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0 
      ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
      : 0;

    // Get unassigned complaints count
    const unassignedComplaints = await Complaint.countDocuments({
      assignedTo: { $exists: false },
      status: { $in: ['pending', 'in_progress'] }
    });

    res.json({
      success: true,
      data: {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        inProgressComplaints,
        recentComplaints,
        unassignedComplaints,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
      }
    });

  } catch (error) {
    console.error('Complaints stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints stats',
      error: error.message
    });
  }
};

// ========================================
// GET COMPLAINT BY ID
// ========================================
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone isVerified')
      .populate('bookingId')
      .populate('assignedTo', 'firstName lastName')
      .populate('adminResponse.respondedBy', 'firstName lastName')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// ========================================
// UPDATE COMPLAINT STATUS
// ========================================
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status,
        lastUpdatedBy: req.user._id
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status',
      error: error.message
    });
  }
};

// ========================================
// ASSIGN COMPLAINT
// ========================================
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        assignedTo: adminId,
        lastUpdatedBy: req.user._id,
        ...(complaint.status === 'pending' && { status: 'in_progress' })
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint',
      error: error.message
    });
  }
};

// ========================================
// ADD COMPLAINT RESPONSE
// ========================================
export const addComplaintResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Response message must be at least 10 characters'
      });
    }

    // First, find the complaint to check its current status
    const existingComplaint = await Complaint.findById(id);
    if (!existingComplaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Prepare update data
    const updateData = {
      adminResponse: {
        message: message.trim(),
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      lastUpdatedBy: req.user._id
    };

    // If complaint is pending, change to in_progress
    if (existingComplaint.status === 'pending') {
      updateData.status = 'in_progress';
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Response added successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Add complaint response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};

// ========================================
// RESOLVE COMPLAINT
// ========================================
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionDescription } = req.body;

    if (!resolutionDescription || resolutionDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Resolution description must be at least 10 characters'
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolution: {
          description: resolutionDescription.trim(),
          resolvedBy: req.user._id,
          resolvedAt: new Date()
        },
        lastUpdatedBy: req.user._id
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      data: complaint
    });

  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving complaint',
      error: error.message
    });
  }
};

// ========================================
// GET COMPLAINT CATEGORIES
// ========================================
export const getComplaintCategories = async (req, res) => {
  try {
    const categories = await Complaint.getCategoryBreakdown();

    const categoryLabels = {
      service_quality: 'Service Quality',
      staff_behavior: 'Staff Behavior',
      billing_payment: 'Billing & Payment',
      booking_process: 'Booking Process',
      facility_equipment: 'Facility & Equipment',
      communication: 'Communication',
      delivery_timing: 'Delivery & Timing',
      other: 'Other'
    };

    const categoriesWithLabels = categories.map(cat => ({
      ...cat,
      label: categoryLabels[cat._id] || cat._id
    }));

    res.json({
      success: true,
      data: categoriesWithLabels
    });

  } catch (error) {
    console.error('Get complaint categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint categories',
      error: error.message
    });
  }
};

// ========================================
// DELETE COMPLAINT
// ========================================
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

// ========================================
// BULK UPDATE COMPLAINTS
// ========================================
export const bulkUpdateComplaints = async (req, res) => {
  try {
    const { complaintIds, action, value } = req.body;

    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Complaint IDs are required'
      });
    }

    let updateData = { lastUpdatedBy: req.user._id };
    
    switch (action) {
      case 'updateStatus':
        updateData.status = value;
        break;
      case 'assign':
        updateData.assignedTo = value;
        break;
      case 'updatePriority':
        updateData.priority = value;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Complaint.updateMany(
      { _id: { $in: complaintIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} complaints`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaints',
      error: error.message
    });
  }
};

// ========================================
// EXPORT COMPLAINTS
// ========================================
export const exportComplaints = async (req, res) => {
  try {
    const { format = 'json', status, category, dateFrom, dateTo } = req.query;

    let filters = {};
    
    if (status && status !== 'all') {
      filters.status = status;
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) {
        filters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    const complaints = await Complaint.find(filters)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        // Headers
        'Complaint ID,Title,Customer Name,Email,Category,Priority,Status,Assigned To,Created At,Resolved At',
        // Data rows
        ...complaints.map(complaint => [
          complaint._id,
          `"${complaint.title.replace(/"/g, '""')}"`, // Escape quotes
          complaint.userInfo.name || '',
          complaint.userInfo.email || '',
          complaint.category,
          complaint.priority,
          complaint.status,
          complaint.assignedTo ? `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 'Unassigned',
          new Date(complaint.createdAt).toLocaleDateString(),
          complaint.resolution?.resolvedAt ? new Date(complaint.resolution.resolvedAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
      return res.send(csv);
    }

    // Default JSON format
    res.json({
      success: true,
      data: complaints,
      exportedAt: new Date(),
      totalCount: complaints.length
    });

  } catch (error) {
    console.error('Export complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting complaints',
      error: error.message
    });
  }
};