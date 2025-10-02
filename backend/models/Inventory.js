import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Backdrop', 'Props', 'Computer', 'Other'],
    default: 'Other'
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair'],
    default: 'Good'
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Use', 'Maintenance', 'Damaged', 'Lost'],
    default: 'Available'
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    min: 0
  },
  warrantyExpiry: {
    type: Date
  },
  rental: {
    isAvailableForRent: {
      type: Boolean,
      default: true
    },
    dailyRate: {
      type: Number,
      required: function() {
        return this.rental?.isAvailableForRent;
      },
      min: 0
    },
    weeklyRate: {
      type: Number,
      min: 0
    },
    monthlyRate: {
      type: Number,
      min: 0
    },
    minimumRentalDays: {
      type: Number,
      default: 1,
      min: 1
    },
    maximumRentalDays: {
      type: Number,
      default: 30,
      min: 1
    },
    depositRequired: {
      type: Boolean,
      default: true
    },
    depositAmount: {
      type: Number,
      min: 0
    }
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 20
    },
    email: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  specifications: {
    type: Map,
    of: String
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    maxlength: 500,
    trim: true
  },
  images: [{
    type: String,
    maxlength: 200
  }],
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Routine', 'Repair', 'Replacement', 'Cleaning'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 300
    },
    cost: {
      type: Number,
      min: 0,
      default: 0
    },
    performedBy: {
      type: String,
      required: true,
      maxlength: 100
    },
    nextMaintenanceDate: Date
  }],
  usageHistory: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    usedDate: {
      type: Date,
      default: Date.now
    },
    returnedDate: Date,
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    notes: String
  }],
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better performance
inventorySchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });
inventorySchema.index({ category: 1, status: 1 });
inventorySchema.index({ serialNumber: 1 });
inventorySchema.index({ createdAt: -1 });

// Virtual for total maintenance cost
inventorySchema.virtual('totalMaintenanceCost').get(function() {
  return this.maintenanceHistory.reduce((total, record) => total + (record.cost || 0), 0);
});

// Virtual for depreciation
inventorySchema.virtual('depreciation').get(function() {
  if (!this.currentValue || !this.purchasePrice) return 0;
  return this.purchasePrice - this.currentValue;
});

// Virtual for age in years
inventorySchema.virtual('ageInYears').get(function() {
  if (!this.purchaseDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.purchaseDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
});

// Method to check if item needs maintenance
inventorySchema.methods.needsMaintenance = function() {
  if (this.maintenanceHistory.length === 0) return false;
  
  const lastMaintenance = this.maintenanceHistory[this.maintenanceHistory.length - 1];
  if (lastMaintenance.nextMaintenanceDate) {
    return new Date() >= lastMaintenance.nextMaintenanceDate;
  }
  
  return false;
};

// Method to check availability for booking
inventorySchema.methods.isAvailableForBooking = function(quantity = 1) {
  return this.status === 'Available' && 
         this.condition !== 'Needs Repair' && 
         this.availableQuantity >= quantity &&
         this.isActive;
};

// Method to check availability for rental
inventorySchema.methods.isAvailableForRental = function(quantity = 1, days = 1) {
  return this.rental?.isAvailableForRent &&
         this.isAvailableForBooking(quantity) &&
         days >= this.rental.minimumRentalDays &&
         days <= this.rental.maximumRentalDays;
};

// Method to calculate rental cost
inventorySchema.methods.calculateRentalCost = function(days = 1, quantity = 1) {
  if (!this.rental?.isAvailableForRent || !this.rental.dailyRate) {
    return { daily: 0, total: 0, deposit: 0 };
  }

  let dailyRate = this.rental.dailyRate;
  
  // Apply weekly/monthly rates if available and cost-effective
  if (days >= 7 && this.rental.weeklyRate) {
    const weeklyEquivalent = this.rental.weeklyRate / 7;
    if (weeklyEquivalent < dailyRate) {
      dailyRate = weeklyEquivalent;
    }
  }
  
  if (days >= 30 && this.rental.monthlyRate) {
    const monthlyEquivalent = this.rental.monthlyRate / 30;
    if (monthlyEquivalent < dailyRate) {
      dailyRate = monthlyEquivalent;
    }
  }

  const total = Math.round(dailyRate * days * quantity);
  const deposit = this.rental.depositRequired ? (this.rental.depositAmount || Math.round(total * 0.2)) : 0;

  return {
    daily: dailyRate,
    total,
    deposit
  };
};

// Method to get usage statistics
inventorySchema.methods.getUsageStats = function() {
  const totalUsage = this.usageHistory.length;
  const currentYear = new Date().getFullYear();
  const thisYearUsage = this.usageHistory.filter(usage => 
    usage.usedDate && usage.usedDate.getFullYear() === currentYear
  ).length;
  
  return {
    totalUsage,
    thisYearUsage,
    averageUsagePerYear: this.ageInYears > 0 ? Math.round(totalUsage / this.ageInYears) : totalUsage
  };
};

// Static method to get inventory statistics
inventorySchema.statics.getInventoryStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: '$currentValue' },
        totalPurchaseValue: { $sum: '$purchasePrice' },
        availableItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
          }
        },
        inUseItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'In Use'] }, 1, 0]
          }
        },
        maintenanceItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0]
          }
        },
        damagedItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Damaged'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalItems: 0,
    totalValue: 0,
    totalPurchaseValue: 0,
    availableItems: 0,
    inUseItems: 0,
    maintenanceItems: 0,
    damagedItems: 0
  };
};

// Pre-save middleware to update availableQuantity based on status
inventorySchema.pre('save', function(next) {
  if (this.status === 'Available') {
    // Available quantity should not exceed total quantity
    if (this.availableQuantity > this.quantity) {
      this.availableQuantity = this.quantity;
    }
  } else if (['In Use', 'Maintenance', 'Damaged', 'Lost'].includes(this.status)) {
    // If not available, set available quantity to 0
    this.availableQuantity = 0;
  }
  
  // Generate QR code if not present
  if (!this.qrCode && this.serialNumber) {
    this.qrCode = `INV-${this.serialNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
  }
  
  next();
});

export default mongoose.model('Inventory', inventorySchema);