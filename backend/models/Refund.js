import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
  // Reference to the booking being refunded
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Reference to the user requesting the refund
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Refund details
  refundNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Financial information
  requestedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  approvedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  refundFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Refund reason and details
  reason: {
    type: String,
    required: true,
    enum: [
      'cancelled_by_customer',
      'service_not_provided',
      'quality_issues',
      'scheduling_conflict',
      'emergency',
      'duplicate_booking',
      'other'
    ]
  },
  
  reasonDescription: {
    type: String,
    maxlength: 500
  },
  
  // Administrative fields
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Important dates
  requestDate: {
    type: Date,
    default: Date.now
  },
  
  approvedDate: {
    type: Date
  },
  
  processedDate: {
    type: Date
  },
  
  completedDate: {
    type: Date
  },
  
  // Payment method for refund
  refundMethod: {
    type: String,
    enum: ['original_payment', 'bank_transfer', 'check', 'cash', 'store_credit'],
    default: 'original_payment'
  },
  
  // Transaction references
  originalTransactionId: {
    type: String
  },
  
  refundTransactionId: {
    type: String
  },
  
  // Customer contact info at time of refund
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  // System metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    refundPolicy: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
refundSchema.index({ userId: 1, status: 1 });
refundSchema.index({ bookingId: 1 });
refundSchema.index({ status: 1, requestDate: -1 });

// Pre-save middleware to generate refund number
refundSchema.pre('validate', async function(next) {
  if (this.isNew && !this.refundNumber) {
    try {
      const count = await this.constructor.countDocuments({});
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const sequence = String(count + 1).padStart(4, '0');
      
      this.refundNumber = `REF-${year}${month}${day}-${sequence}`;
    } catch (error) {
      console.error('Error generating refund number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now();
      this.refundNumber = `REF-${timestamp}`;
    }
  }
  next();
});

// Instance methods
refundSchema.methods.canBeCancelled = function() {
  return ['pending', 'approved'].includes(this.status);
};

refundSchema.methods.canBeApproved = function() {
  return this.status === 'pending';
};

refundSchema.methods.canBeProcessed = function() {
  return this.status === 'approved';
};

refundSchema.methods.calculateRefundAmount = function() {
  return Math.max(0, this.approvedAmount - this.refundFee);
};

// Static methods
refundSchema.statics.generateRefundNumber = async function() {
  try {
    const count = await this.countDocuments({});
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    
    let refundNumber = `REF-${year}${month}${day}-${sequence}`;
    
    // Check if this number already exists (in case of concurrent requests)
    const existing = await this.findOne({ refundNumber });
    if (existing) {
      // Use timestamp as fallback for uniqueness
      const timestamp = Date.now();
      refundNumber = `REF-${timestamp}`;
    }
    
    return refundNumber;
  } catch (error) {
    console.error('Error generating refund number:', error);
    // Ultimate fallback
    return `REF-${Date.now()}`;
  }
};

refundSchema.statics.getRefundStats = async function(userId = null) {
  const pipeline = [];
  
  if (userId) {
    pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
  }
  
  pipeline.push({
    $group: {
      _id: null,
      totalRefunds: { $sum: 1 },
      totalRequestedAmount: { $sum: '$requestedAmount' },
      totalApprovedAmount: { $sum: '$approvedAmount' },
      totalRefundFees: { $sum: '$refundFee' },
      pendingRefunds: {
        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
      },
      approvedRefunds: {
        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
      },
      processedRefunds: {
        $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
      },
      completedRefunds: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      rejectedRefunds: {
        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
      }
    }
  });
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalRefunds: 0,
    totalRequestedAmount: 0,
    totalApprovedAmount: 0,
    totalRefundFees: 0,
    pendingRefunds: 0,
    approvedRefunds: 0,
    processedRefunds: 0,
    completedRefunds: 0,
    rejectedRefunds: 0
  };
};

// Virtual for net refund amount
refundSchema.virtual('netRefundAmount').get(function() {
  return this.calculateRefundAmount();
});

// Ensure virtual fields are serialized
refundSchema.set('toJSON', { virtuals: true });
refundSchema.set('toObject', { virtuals: true });

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;