import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Optional for guest bookings
  },
  
  // Customer Information
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  
  // Package Information
  packageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Package', 
    required: true 
  },
  packageName: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  
  // Time Slot Information
  slotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours
  
  // Pricing Information
  slotPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  // Payment Information
  paymentMethod: { 
    type: String, 
    enum: ['card', 'credit_card', 'debit_card', 'bank_transfer', 'cash'], 
    default: 'card' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentDetails: {
    transactionId: { type: String }, // Transaction ID from payment gateway
    paymentId: { type: String }, // Internal payment ID
    gateway: { type: String }, // Payment gateway used (stripe, paypal, etc.)
    method: { type: String }, // Specific payment method
    amount: { type: Number }, // Amount processed
    currency: { type: String, default: 'USD' },
    processedAt: { type: Date }, // When payment was processed
    instructions: { type: String }, // Payment instructions (for bank transfer, cash)
    failureReason: { type: String }, // Reason for payment failure
    attemptedAt: { type: Date }, // When payment was attempted
    adminNotes: [{ // Admin notes for manual payment updates
      note: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedAt: { type: Date, default: Date.now }
    }]
  },
  paymentCompletedAt: { type: Date }, // Timestamp when payment was completed
  
  // Booking Status
  bookingStatus: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'], 
    default: 'confirmed' 
  },
  
  // Additional Information
  specialRequests: { type: String, default: "" },
  notes: { type: String, default: "" },
  
  // Admin Tracking
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // For admin-created bookings
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // For admin updates
  },
  
  // Timestamps
  bookedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index for efficient queries
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });
bookingSchema.index({ 'customerInfo.email': 1 });
bookingSchema.index({ packageId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Pre-save middleware to update the updatedAt timestamp
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted booking date
bookingSchema.virtual('formattedBookingDate').get(function() {
  return this.bookingDate.toLocaleDateString();
});

// Virtual for booking reference number
bookingSchema.virtual('bookingReference').get(function() {
  return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDateTime = new Date(`${this.bookingDate.toDateString()} ${this.bookingTime}`);
  const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
  
  return hoursDiff >= 24 && 
         this.bookingStatus === 'confirmed' && 
         this.paymentStatus === 'completed';
};

// Static method to get booking statistics
bookingSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingPayments: 0
  };
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;