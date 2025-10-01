import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  // Package reference
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  
  // Date and time information
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "09:00" (24-hour format)
  },
  endTime: {
    type: String,
    required: true // Format: "12:00" (24-hour format)
  },
  
  // Availability and pricing
  isAvailable: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Additional information
  notes: {
    type: String,
    default: ""
  },
  
  // Booking reference (if slot is booked)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
slotSchema.index({ packageId: 1, date: 1, startTime: 1 });
slotSchema.index({ date: 1, isAvailable: 1 });
slotSchema.index({ packageId: 1, isAvailable: 1 });

// Virtual for formatted date
slotSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for duration calculation
slotSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const start = new Date(`1970-01-01T${this.startTime}:00`);
  const end = new Date(`1970-01-01T${this.endTime}:00`);
  
  return (end - start) / (1000 * 60 * 60); // Duration in hours
});

// Method to check if slot conflicts with another slot
slotSchema.methods.conflictsWith = function(otherSlot) {
  if (this.date.toDateString() !== otherSlot.date.toDateString()) {
    return false;
  }
  
  const thisStart = new Date(`1970-01-01T${this.startTime}:00`);
  const thisEnd = new Date(`1970-01-01T${this.endTime}:00`);
  const otherStart = new Date(`1970-01-01T${otherSlot.startTime}:00`);
  const otherEnd = new Date(`1970-01-01T${otherSlot.endTime}:00`);
  
  return (thisStart < otherEnd && thisEnd > otherStart);
};

// Static method to find available slots for a package within a date range
slotSchema.statics.findAvailableSlots = async function(packageId, startDate, endDate) {
  return await this.find({
    packageId: packageId,
    date: {
      $gte: startDate,
      $lte: endDate
    },
    isAvailable: true,
    status: 'available'
  }).sort({ date: 1, startTime: 1 });
};

// Static method to get slots statistics for admin dashboard
slotSchema.statics.getSlotStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSlots: { $sum: 1 },
        availableSlots: {
          $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
        },
        bookedSlots: {
          $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] }
        },
        blockedSlots: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
        },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    blockedSlots: 0,
    averagePrice: 0
  };
};

// Pre-save middleware to validate slot times
slotSchema.pre('save', function(next) {
  // Ensure start time is before end time
  const start = new Date(`1970-01-01T${this.startTime}:00`);
  const end = new Date(`1970-01-01T${this.endTime}:00`);
  
  if (start >= end) {
    return next(new Error('Start time must be before end time'));
  }
  
  // Ensure date is not in the past (for new slots)
  if (this.isNew && this.date < new Date().setHours(0, 0, 0, 0)) {
    return next(new Error('Cannot create slots for past dates'));
  }
  
  next();
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;