import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },

  // Complaint Details
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: {
      values: [
        'service_quality',
        'staff_behavior', 
        'billing_payment',
        'booking_process',
        'facility_equipment',
        'communication',
        'delivery_timing',
        'other'
      ],
      message: 'Please select a valid complaint category'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Booking Reference (Optional)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  bookingInfo: {
    packageName: String,
    bookingDate: Date,
    amount: Number
  },

  // Complaint Status and Resolution
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    respondedAt: Date
  },
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Admin tracking
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ priority: 1, status: 1 });

// Virtual for complaint age
complaintSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance methods
complaintSchema.methods.canBeEditedBy = function(userId) {
  // Users can edit their own complaints within 24 hours if status is pending
  const hoursSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return this.userId.toString() === userId.toString() && 
         this.status === 'pending' && 
         hoursSinceCreated < 24;
};

complaintSchema.methods.canBeDeletedBy = function(userId) {
  // Users can delete their own complaints within 1 hour if status is pending
  const hoursSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return this.userId.toString() === userId.toString() && 
         this.status === 'pending' && 
         hoursSinceCreated < 1;
};

complaintSchema.methods.updateStatus = function(newStatus, adminId = null) {
  this.status = newStatus;
  if (adminId) {
    this.lastUpdatedBy = adminId;
  }
  
  if (newStatus === 'resolved' && !this.resolution.resolvedAt) {
    this.resolution.resolvedAt = new Date();
    if (adminId) {
      this.resolution.resolvedBy = adminId;
    }
  }
  
  return this.save();
};

// Static methods for statistics
complaintSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalComplaints: { $sum: 1 },
        pendingComplaints: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        resolvedComplaints: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              {
                $divide: [
                  { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              },
              null
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    avgResolutionTime: 0
  };
};

complaintSchema.statics.getCategoryBreakdown = async function(userId = null) {
  const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save middleware
complaintSchema.pre('save', function(next) {
  // Auto-set priority based on keywords in title or description
  if (this.isNew && this.priority === 'medium') {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately'];
    const highKeywords = ['important', 'critical', 'serious', 'major'];
    
    const text = (this.title + ' ' + this.description).toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => text.includes(keyword))) {
      this.priority = 'high';
    }
  }
  
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;