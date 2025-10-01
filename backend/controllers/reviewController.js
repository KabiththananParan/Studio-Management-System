import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @desc    Create a new review
// @route   POST /api/user/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const {
      bookingId,
      rating,
      comment,
      reviewTitle,
      categoryRatings,
      wouldRecommend
    } = req.body;

    // Validate required fields
    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, rating, and comment are required"
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('packageId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify ownership (user owns booking or admin)
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    const ownsBooking = booking.userId && booking.userId.toString() === req.user.id;
    
    if (!isAdmin && !ownsBooking) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this booking"
      });
    }

    // Check if booking is completed or payment is completed
    if (booking.paymentStatus !== 'completed' && booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings or bookings with completed payment"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking",
        reviewId: existingReview._id
      });
    }

    // Filter categoryRatings to remove 0 or falsy values
    const filteredCategoryRatings = {};
    if (categoryRatings && typeof categoryRatings === 'object') {
      Object.keys(categoryRatings).forEach(key => {
        const value = categoryRatings[key];
        if (value && value > 0 && value <= 5) {
          filteredCategoryRatings[key] = value;
        }
      });
    }

    // Create the review
    const review = new Review({
      bookingId,
      userId: req.user.id,
      rating,
      comment: comment.trim(),
      reviewTitle: reviewTitle?.trim(),
      categoryRatings: Object.keys(filteredCategoryRatings).length > 0 ? filteredCategoryRatings : undefined,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true
    });

    await review.save();

    // Update booking to mark as reviewed
    booking.hasReview = true;
    booking.reviewId = review._id;
    await booking.save();

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('bookingId', 'packageName bookingDate totalAmount')
      .populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: {
        _id: populatedReview._id,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        reviewTitle: populatedReview.reviewTitle,
        categoryRatings: populatedReview.categoryRatings,
        wouldRecommend: populatedReview.wouldRecommend,
        customerInfo: populatedReview.customerInfo,
        bookingInfo: populatedReview.bookingInfo,
        createdAt: populatedReview.createdAt,
        canEdit: populatedReview.canBeEditedBy(req.user.id)
      }
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/user/reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { 
      userId: req.user.id,
      status: 'active'
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .populate({
        path: 'bookingId',
        select: 'packageName bookingDate totalAmount customerInfo',
        populate: {
          path: 'packageId',
          select: 'name price description'
        }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    // Get user's review statistics
    const stats = await Review.getUserReviewStats(req.user.id);

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      reviewTitle: review.reviewTitle,
      categoryRatings: review.categoryRatings,
      averageCategoryRating: review.averageCategoryRating,
      wouldRecommend: review.wouldRecommend,
      customerInfo: review.customerInfo,
      bookingInfo: review.bookingInfo,
      helpfulVotes: review.helpfulVotes,
      businessResponse: review.businessResponse,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      canEdit: review.canBeEditedBy(req.user.id),
      canDelete: review.canBeDeletedBy(req.user.id),
      booking: review.bookingId
    }));

    res.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get review by ID
// @route   GET /api/user/reviews/:id
// @access  Private
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate({
        path: 'bookingId',
        select: 'packageName bookingDate totalAmount customerInfo bookingStatus paymentStatus',
        populate: {
          path: 'packageId',
          select: 'name price description features'
        }
      })
      .populate('userId', 'firstName lastName email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Verify ownership (user owns review or admin)
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    const ownsReview = review.userId._id.toString() === req.user.id;
    
    if (!isAdmin && !ownsReview) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this review"
      });
    }

    res.json({
      success: true,
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        reviewTitle: review.reviewTitle,
        categoryRatings: review.categoryRatings,
        averageCategoryRating: review.averageCategoryRating,
        wouldRecommend: review.wouldRecommend,
        customerInfo: review.customerInfo,
        bookingInfo: review.bookingInfo,
        helpfulVotes: review.helpfulVotes,
        businessResponse: review.businessResponse,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        canEdit: review.canBeEditedBy(req.user.id),
        canDelete: review.canBeDeletedBy(req.user.id),
        booking: review.bookingId
      }
    });
  } catch (error) {
    console.error("Error fetching review details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/user/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating,
      comment,
      reviewTitle,
      categoryRatings,
      wouldRecommend
    } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user can edit this review
    if (!review.canBeEditedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Cannot edit this review. Reviews can only be edited within 24 hours by the author."
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();
    if (reviewTitle !== undefined) review.reviewTitle = reviewTitle?.trim();
    if (categoryRatings !== undefined) {
      // Filter categoryRatings to remove 0 or falsy values
      const filteredCategoryRatings = {};
      if (categoryRatings && typeof categoryRatings === 'object') {
        Object.keys(categoryRatings).forEach(key => {
          const value = categoryRatings[key];
          if (value && value > 0 && value <= 5) {
            filteredCategoryRatings[key] = value;
          }
        });
      }
      review.categoryRatings = Object.keys(filteredCategoryRatings).length > 0 ? filteredCategoryRatings : {};
    }
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;

    await review.save();

    // Populate for response
    const updatedReview = await Review.findById(id)
      .populate('bookingId', 'packageName bookingDate totalAmount')
      .populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      message: "Review updated successfully",
      review: {
        _id: updatedReview._id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        reviewTitle: updatedReview.reviewTitle,
        categoryRatings: updatedReview.categoryRatings,
        averageCategoryRating: updatedReview.averageCategoryRating,
        wouldRecommend: updatedReview.wouldRecommend,
        customerInfo: updatedReview.customerInfo,
        bookingInfo: updatedReview.bookingInfo,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        canEdit: updatedReview.canBeEditedBy(req.user.id)
      }
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/user/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user can delete this review
    if (!review.canBeDeletedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review"
      });
    }

    // Update booking to remove review reference
    if (review.bookingId) {
      await Booking.findByIdAndUpdate(review.bookingId, {
        hasReview: false,
        $unset: { reviewId: 1 }
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Check if booking can be reviewed
// @route   GET /api/user/bookings/:bookingId/review-eligibility
// @access  Private
export const checkReviewEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify ownership
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    const ownsBooking = booking.userId && booking.userId.toString() === req.user.id;
    
    if (!isAdmin && !ownsBooking) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check review eligibility for this booking"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });

    // Determine eligibility
    let eligible = true;
    let reason = '';

    if (existingReview) {
      eligible = false;
      reason = 'Review already submitted';
    } else if (booking.paymentStatus !== 'completed' && booking.bookingStatus !== 'completed') {
      eligible = false;
      reason = 'Booking must be completed or payment must be completed to leave a review';
    }

    res.json({
      success: true,
      eligibility: {
        eligible,
        reason: eligible ? 'Eligible to submit review' : reason,
        existingReview: existingReview ? {
          reviewId: existingReview._id,
          rating: existingReview.rating,
          createdAt: existingReview.createdAt,
          canEdit: existingReview.canBeEditedBy(req.user.id)
        } : null,
        booking: {
          _id: booking._id,
          packageName: booking.packageName,
          bookingDate: booking.bookingDate,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          totalAmount: booking.totalAmount
        }
      }
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get all reviews (public endpoint for displaying reviews)
// @route   GET /api/reviews/public
// @access  Public
export const getPublicReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating = 1,
      maxRating = 5
    } = req.query;

    // Build filter for public reviews
    const filter = {
      status: 'active',
      isVerified: true,
      rating: { $gte: parseInt(minRating), $lte: parseInt(maxRating) }
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get reviews
    const reviews = await Review.find(filter)
      .select('rating comment reviewTitle categoryRatings wouldRecommend customerInfo bookingInfo helpfulVotes businessResponse createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    // Get overall statistics
    const stats = await Review.getAverageRating(filter);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        reviewTitle: review.reviewTitle,
        categoryRatings: review.categoryRatings,
        averageCategoryRating: review.averageCategoryRating,
        wouldRecommend: review.wouldRecommend,
        customerInfo: {
          name: review.customerInfo.name,
          verifiedCustomer: review.customerInfo.verifiedCustomer
        },
        bookingInfo: {
          packageName: review.bookingInfo.packageName,
          bookingDate: review.bookingInfo.bookingDate
        },
        helpfulVotes: review.helpfulVotes,
        businessResponse: review.businessResponse,
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats
    });
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};