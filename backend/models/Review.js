import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Reference to the booking being reviewed
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // One review per booking
  },
  
  // Reference to the user who wrote the review
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
    trim: true
  },
  
  // Review categories (optional detailed ratings)
  categoryRatings: {
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v == null || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Service quality rating must be an integer between 1 and 5'
      }
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v == null || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Communication rating must be an integer between 1 and 5'
      }
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v == null || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Value for money rating must be an integer between 1 and 5'
      }
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v == null || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Professionalism rating must be an integer between 1 and 5'
      }
    }
  },
  
  // Review metadata
  reviewTitle: {
    type: String,
    maxlength: 100,
    trim: true
  },
  
  // Recommendation
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  // Review status
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged', 'deleted'],
    default: 'active'
  },
  
  // Admin moderation
  isVerified: {
    type: Boolean,
    default: true // Auto-verify for now, can be changed for moderation
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  moderatedAt: {
    type: Date
  },
  
  moderationNotes: {
    type: String,
    maxlength: 500
  },
  
  // Customer information at time of review (for display)
  customerInfo: {
    name: String,
    email: String,
    verifiedCustomer: {
      type: Boolean,
      default: true
    }
  },
  
  // Booking information for context
  bookingInfo: {
    packageName: String,
    bookingDate: Date,
    totalAmount: Number
  },
  
  // Review interaction
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Response from business (optional)
  businessResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ userId: 1, createdAt: -1 });
// Note: bookingId already has unique index from field definition (unique: true)
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1, isVerified: 1 });
reviewSchema.index({ createdAt: -1 }); // For recent reviews

// Virtual for average category rating
reviewSchema.virtual('averageCategoryRating').get(function() {
  const ratings = this.categoryRatings;
  if (!ratings) return null;
  
  const validRatings = Object.values(ratings).filter(rating => rating != null);
  if (validRatings.length === 0) return null;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10; // Round to 1 decimal
});

// Instance methods
reviewSchema.methods.canBeEditedBy = function(userId) {
  // Only the review author can edit within 24 hours
  const reviewAge = Date.now() - this.createdAt.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  return this.userId.toString() === userId.toString() && reviewAge < twentyFourHours;
};

reviewSchema.methods.canBeDeletedBy = function(userId) {
  // Author can delete, or admin can hide
  return this.userId.toString() === userId.toString();
};

// Static methods
reviewSchema.statics.getAverageRating = async function(filters = {}) {
  const pipeline = [
    { $match: { status: 'active', isVerified: true, ...filters } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

reviewSchema.statics.getUserReviewStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        latestReview: { $max: '$createdAt' }
      }
    }
  ]);
  
  return stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    latestReview: null
  };
};

// Pre-save middleware
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Auto-populate customer info from user and booking
    if (this.userId && this.bookingId) {
      try {
        const [user, booking] = await Promise.all([
          mongoose.model('User').findById(this.userId),
          mongoose.model('Booking').findById(this.bookingId).populate('packageId')
        ]);
        
        if (user) {
          this.customerInfo = {
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            verifiedCustomer: true
          };
        }
        
        if (booking) {
          this.bookingInfo = {
            packageName: booking.packageName,
            bookingDate: booking.bookingDate,
            totalAmount: booking.totalAmount
          };
        }
      } catch (error) {
        console.error('Error populating review info:', error);
      }
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;