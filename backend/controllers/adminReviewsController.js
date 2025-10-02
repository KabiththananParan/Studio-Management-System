import Review from "../models/Review.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// ========================================
// GET ALL REVIEWS WITH FILTERING & SEARCH
// ========================================
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      rating,
      verified,
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
        { 'customerInfo.name': searchRegex },
        { 'customerInfo.email': searchRegex },
        { comment: searchRegex },
        { reviewTitle: searchRegex },
        { 'bookingInfo.packageName': searchRegex }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filters.status = status;
    }

    // Rating filter
    if (rating && rating !== 'all') {
      if (rating === '4plus') {
        filters.rating = { $gte: 4 };
      } else if (rating === '3plus') {
        filters.rating = { $gte: 3 };
      } else {
        filters.rating = parseInt(rating);
      }
    }

    // Verification filter
    if (verified === 'true') {
      filters.isVerified = true;
    } else if (verified === 'false') {
      filters.isVerified = false;
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
    const [reviews, totalReviews] = await Promise.all([
      Review.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'firstName lastName email isVerified')
        .populate('bookingId', 'packageName bookingDate totalAmount')
        .populate('moderatedBy', 'firstName lastName')
        .populate('businessResponse.respondedBy', 'firstName lastName')
        .lean(),
      Review.countDocuments(filters)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalReviews,
          hasNext,
          hasPrev,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// ========================================
// GET REVIEWS ANALYTICS
// ========================================
export const getReviewsAnalytics = async (req, res) => {
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

    // Rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { status: 'active', ...dateFilter } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Reviews over time
    const reviewsOverTime = await Review.aggregate([
      { $match: { status: 'active', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category ratings breakdown
    const categoryRatings = await Review.aggregate([
      { $match: { status: 'active', categoryRatings: { $exists: true }, ...dateFilter } },
      {
        $group: {
          _id: null,
          avgServiceQuality: { $avg: '$categoryRatings.serviceQuality' },
          avgCommunication: { $avg: '$categoryRatings.communication' },
          avgValueForMoney: { $avg: '$categoryRatings.valueForMoney' },
          avgProfessionalism: { $avg: '$categoryRatings.professionalism' }
        }
      }
    ]);

    // Package performance
    const packagePerformance = await Review.aggregate([
      { $match: { status: 'active', ...dateFilter } },
      {
        $group: {
          _id: '$bookingInfo.packageName',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          recommendationRate: {
            $avg: { $cond: [{ $eq: ['$wouldRecommend', true] }, 1, 0] }
          }
        }
      },
      { $match: { totalReviews: { $gte: 3 } } }, // Only packages with 3+ reviews
      { $sort: { avgRating: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        ratingDistribution,
        reviewsOverTime,
        categoryRatings: categoryRatings[0] || {},
        packagePerformance
      }
    });

  } catch (error) {
    console.error('Reviews analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews analytics',
      error: error.message
    });
  }
};

// ========================================
// GET REVIEWS STATS
// ========================================
export const getReviewsStats = async (req, res) => {
  try {
    const [
      totalStats,
      recentStats,
      statusBreakdown,
      averageRating
    ] = await Promise.all([
      // Total reviews
      Review.countDocuments(),
      
      // Recent reviews (last 30 days)
      Review.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Status breakdown
      Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Average rating
      Review.getAverageRating()
    ]);

    // Pending moderation count
    const pendingModeration = await Review.countDocuments({
      isVerified: false
    });

    // Response rate (reviews with business responses)
    const withResponses = await Review.countDocuments({
      'businessResponse.message': { $exists: true }
    });
    
    const responseRate = totalStats > 0 ? ((withResponses / totalStats) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalReviews: totalStats,
        recentReviews: recentStats,
        pendingModeration,
        averageRating: averageRating.averageRating,
        responseRate: parseFloat(responseRate),
        statusBreakdown,
        ratingDistribution: averageRating.ratingDistribution
      }
    });

  } catch (error) {
    console.error('Reviews stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews stats',
      error: error.message
    });
  }
};

// ========================================
// GET REVIEW BY ID
// ========================================
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'firstName lastName email isVerified phone')
      .populate('bookingId')
      .populate('moderatedBy', 'firstName lastName')
      .populate('businessResponse.respondedBy', 'firstName lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// ========================================
// UPDATE REVIEW STATUS
// ========================================
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;

    const validStatuses = ['active', 'hidden', 'flagged', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        status,
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        ...(moderationNotes && { moderationNotes })
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
      error: error.message
    });
  }
};

// ========================================
// ADD BUSINESS RESPONSE
// ========================================
export const addBusinessResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Response message must be at least 10 characters'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        businessResponse: {
          message: message.trim(),
          respondedBy: req.user._id,
          respondedAt: new Date()
        }
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Business response added successfully',
      data: review
    });

  } catch (error) {
    console.error('Add business response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding business response',
      error: error.message
    });
  }
};

// ========================================
// MODERATE REVIEW
// ========================================
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, moderationNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      {
        isVerified,
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        ...(moderationNotes && { moderationNotes })
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: review
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating review',
      error: error.message
    });
  }
};

// ========================================
// DELETE REVIEW
// ========================================
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// ========================================
// BULK UPDATE REVIEWS
// ========================================
export const bulkUpdateReviews = async (req, res) => {
  try {
    const { reviewIds, action, value } = req.body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review IDs are required'
      });
    }

    let updateData = {};
    
    switch (action) {
      case 'updateStatus':
        updateData = {
          status: value,
          moderatedBy: req.user._id,
          moderatedAt: new Date()
        };
        break;
      case 'verify':
        updateData = {
          isVerified: true,
          moderatedBy: req.user._id,
          moderatedAt: new Date()
        };
        break;
      case 'unverify':
        updateData = {
          isVerified: false,
          moderatedBy: req.user._id,
          moderatedAt: new Date()
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} reviews`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reviews',
      error: error.message
    });
  }
};

// ========================================
// EXPORT REVIEWS
// ========================================
export const exportReviews = async (req, res) => {
  try {
    const { format = 'json', status, dateFrom, dateTo } = req.query;

    let filters = {};
    
    if (status && status !== 'all') {
      filters.status = status;
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

    const reviews = await Review.find(filters)
      .populate('userId', 'firstName lastName email')
      .populate('bookingId', 'packageName bookingDate')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        // Headers
        'Review ID,Customer Name,Email,Rating,Comment,Package,Booking Date,Status,Created At',
        // Data rows
        ...reviews.map(review => [
          review._id,
          review.customerInfo.name || '',
          review.customerInfo.email || '',
          review.rating,
          `"${review.comment.replace(/"/g, '""')}"`, // Escape quotes
          review.bookingInfo.packageName || '',
          review.bookingInfo.bookingDate ? new Date(review.bookingInfo.bookingDate).toLocaleDateString() : '',
          review.status,
          new Date(review.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv');
      return res.send(csv);
    }

    // Default JSON format
    res.json({
      success: true,
      data: reviews,
      exportedAt: new Date(),
      totalCount: reviews.length
    });

  } catch (error) {
    console.error('Export reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting reviews',
      error: error.message
    });
  }
};