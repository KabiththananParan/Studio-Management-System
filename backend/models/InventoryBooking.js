import mongoose from 'mongoose';

const inventoryBookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: function() {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `IB-${timestamp}-${random}`;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  bookingDates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in days
      required: true,
      min: 1
    }
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      zipCode: String
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: [
      'Pending', 
      'Confirmed', 
      'Payment Due', 
      'Paid', 
      'Equipment Ready', 
      'Checked Out', 
      'In Use', 
      'Returned', 
      'Completed', 
      'Cancelled',
      'Overdue'
    ],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['Card', 'Bank Transfer', 'Cash', 'Pending'],
      default: 'Pending'
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentDate: Date,
    transactionId: String,
    paymentReference: String
  },
  deposit: {
    required: {
      type: Boolean,
      default: true
    },
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    }
  },
  notes: {
    userNotes: {
      type: String,
      maxlength: 500
    },
    adminNotes: {
      type: String,
      maxlength: 500
    },
    specialRequirements: {
      type: String,
      maxlength: 300
    }
  },
  timeline: {
    bookingCreated: {
      type: Date,
      default: Date.now
    },
    paymentDue: Date,
    equipmentReadyDate: Date,
    checkoutDate: Date,
    returnDate: Date,
    completedDate: Date
  },
  checkoutDetails: {
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    checkoutTime: Date,
    equipmentCondition: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory'
      },
      condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Minor Issues']
      },
      notes: String
    }],
    returnTime: Date,
    returnCondition: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory'
      },
      condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Damaged']
      },
      notes: String,
      damageCharges: {
        type: Number,
        default: 0
      }
    }]
  },
  cancellation: {
    cancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'cancellation.cancelledByModel'
    },
    cancelledByModel: {
      type: String,
      enum: ['User', 'Admin']
    },
    cancellationDate: Date,
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Denied'],
      default: 'Pending'
    }
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
// Note: bookingId already has unique index from field definition, no need for additional index
inventoryBookingSchema.index({ user: 1, createdAt: -1 });
inventoryBookingSchema.index({ 'bookingDates.startDate': 1, 'bookingDates.endDate': 1 });
inventoryBookingSchema.index({ status: 1 });
inventoryBookingSchema.index({ paymentStatus: 1 });
inventoryBookingSchema.index({ 'items.inventory': 1 });

// Virtual for total days calculation
inventoryBookingSchema.virtual('totalDays').get(function() {
  if (!this.bookingDates.startDate || !this.bookingDates.endDate) return 0;
  const diffTime = Math.abs(this.bookingDates.endDate - this.bookingDates.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
});

// Virtual for booking age
inventoryBookingSchema.virtual('bookingAge').get(function() {
  const diffTime = Math.abs(new Date() - this.timeline.bookingCreated);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
inventoryBookingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'In Use' && this.bookingDates.endDate < new Date()) {
    return true;
  }
  return false;
});

// Pre-save middleware to calculate totals
inventoryBookingSchema.pre('save', function(next) {
  // BookingId is now generated by default function, no need to generate here

  // Calculate duration
  if (this.bookingDates.startDate && this.bookingDates.endDate) {
    const diffTime = Math.abs(this.bookingDates.endDate - this.bookingDates.startDate);
    this.bookingDates.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    const subtotal = this.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.dailyRate * this.bookingDates.duration;
      item.subtotal = itemTotal;
      return total + itemTotal;
    }, 0);
    
    this.pricing.subtotal = subtotal;
    
    // Calculate total (subtotal + tax - discount)
    this.pricing.total = this.pricing.subtotal + this.pricing.tax - this.pricing.discount;
    
    // Set remaining amount
    this.paymentInfo.remainingAmount = this.pricing.total - this.paymentInfo.paidAmount;
  }

  // Set deposit amount (typically 20% of total)
  if (this.deposit.required && this.deposit.amount === 0) {
    this.deposit.amount = Math.round(this.pricing.total * 0.2);
  }

  // Set payment due date (typically 48 hours before start date)
  if (!this.timeline.paymentDue && this.bookingDates.startDate) {
    this.timeline.paymentDue = new Date(this.bookingDates.startDate.getTime() - (2 * 24 * 60 * 60 * 1000));
  }

  // Update status based on dates and payments
  this.updateBookingStatus();

  next();
});

// Method to update booking status
inventoryBookingSchema.methods.updateBookingStatus = function() {
  const now = new Date();
  
  if (this.cancellation.cancelled) {
    this.status = 'Cancelled';
    return;
  }

  if (this.paymentStatus === 'Paid' && this.status === 'Payment Due') {
    this.status = 'Paid';
  }

  if (this.status === 'In Use' && this.bookingDates.endDate < now) {
    this.status = 'Overdue';
  }

  if (this.checkoutDetails.returnTime && this.status !== 'Completed') {
    this.status = 'Completed';
  }
};

// Method to check if booking can be cancelled
inventoryBookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const startDate = new Date(this.bookingDates.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  
  // Can cancel if booking hasn't started and is at least 24 hours before start
  return hoursUntilStart > 24 && !['Checked Out', 'In Use', 'Returned', 'Completed', 'Cancelled'].includes(this.status);
};

// Method to calculate refund amount
inventoryBookingSchema.methods.calculateRefundAmount = function() {
  const now = new Date();
  const startDate = new Date(this.bookingDates.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilStart > 72) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursUntilStart > 48) {
    refundPercentage = 0.7; // 70% refund
  } else if (hoursUntilStart > 24) {
    refundPercentage = 0.5; // 50% refund
  }
  
  return Math.round(this.paymentInfo.paidAmount * refundPercentage);
};

// Method to check equipment availability
inventoryBookingSchema.statics.checkAvailability = async function(inventoryId, startDate, endDate, excludeBookingId = null) {
  const query = {
    'items.inventory': inventoryId,
    status: { $nin: ['Cancelled', 'Completed'] },
    $or: [
      {
        'bookingDates.startDate': { $lte: endDate },
        'bookingDates.endDate': { $gte: startDate }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await this.find(query);
  return conflictingBookings;
};

// Static method to get booking statistics
inventoryBookingSchema.statics.getBookingStats = async function(userId = null) {
  const matchQuery = userId ? { user: userId } : {};
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageBookingValue: { $avg: '$pricing.total' },
        pendingBookings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
          }
        },
        activeBookings: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Paid', 'Equipment Ready', 'Checked Out', 'In Use']] }, 1, 0]
          }
        },
        completedBookings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        },
        cancelledBookings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  };
};

export default mongoose.model('InventoryBooking', inventoryBookingSchema);