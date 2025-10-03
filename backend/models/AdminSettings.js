import mongoose from 'mongoose';

const AdminSettingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'],
    unique: true
  },
  
  // General Settings
  general: {
    siteName: { type: String, default: 'StudioPro Management' },
    siteDescription: { type: String, default: 'Professional photography studio management system' },
    contactEmail: { type: String, default: 'admin@studiopro.com' },
    contactPhone: { type: String, default: '+1 (555) 123-4567' },
    businessHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      workingDays: { 
        type: [String], 
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 10, min: 0, max: 100 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true }
  },
  
  // Email Settings
  email: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' }, // Should be encrypted in production
    fromName: { type: String, default: 'StudioPro' },
    fromEmail: { type: String, default: 'noreply@studiopro.com' },
    enableEmailNotifications: { type: Boolean, default: true },
    enableBookingConfirmations: { type: Boolean, default: true },
    enablePaymentNotifications: { type: Boolean, default: true },
    enableRefundNotifications: { type: Boolean, default: true },
    enableReminderEmails: { type: Boolean, default: true },
    reminderHoursBefore: { type: Number, default: 24, min: 1, max: 72 }
  },
  
  // Security Settings
  security: {
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    lockoutDuration: { type: Number, default: 30, min: 5, max: 120 }, // minutes
    sessionTimeout: { type: Number, default: 60, min: 15, max: 480 }, // minutes
    requirePasswordChange: { type: Boolean, default: false },
    passwordChangeInterval: { type: Number, default: 90, min: 30, max: 365 }, // days
    enableTwoFactor: { type: Boolean, default: false },
    minPasswordLength: { type: Number, default: 8, min: 6, max: 20 },
    requireSpecialChars: { type: Boolean, default: true },
    allowedFileTypes: { 
      type: [String], 
      default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      validate: {
        validator: function(arr) {
          return arr.every(type => /^[a-zA-Z0-9]+$/.test(type));
        },
        message: 'File types must contain only alphanumeric characters'
      }
    },
    maxFileSize: { type: Number, default: 10, min: 1, max: 100 }, // MB
    ipWhitelist: { type: [String], default: [] }
  },
  
  // Booking Settings
  booking: {
    bookingWindowDays: { type: Number, default: 90, min: 30, max: 365 },
    minAdvanceBookingHours: { type: Number, default: 24, min: 1, max: 168 },
    maxAdvanceBookingDays: { type: Number, default: 365, min: 30, max: 730 },
    allowSameDayBooking: { type: Boolean, default: false },
    autoConfirmBookings: { type: Boolean, default: false },
    requireDepositPercentage: { type: Number, default: 25, min: 0, max: 100 },
    cancellationDeadlineHours: { type: Number, default: 48, min: 1, max: 168 },
    refundProcessingDays: { type: Number, default: 5, min: 1, max: 30 },
    overduePaymentGraceDays: { type: Number, default: 3, min: 1, max: 14 },
    reminderEmailDays: { type: [Number], default: [7, 3, 1] },
    allowBookingModification: { type: Boolean, default: true },
    maxRescheduleCount: { type: Number, default: 2, min: 0, max: 5 }
  },
  
  // Payment Settings
  payment: {
    enableStripe: { type: Boolean, default: false },
    enablePayPal: { type: Boolean, default: false },
    enableCashPayments: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: true },
    stripePublicKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' }, // Should be encrypted
    paypalClientId: { type: String, default: '' },
    paypalSecret: { type: String, default: '' }, // Should be encrypted
    processingFeePercentage: { type: Number, default: 2.9, min: 0, max: 10 },
    processingFeeFixed: { type: Number, default: 0.30, min: 0, max: 5 },
    paymentMethods: {
      creditCard: { type: Boolean, default: true },
      debitCard: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: true },
      cash: { type: Boolean, default: true },
      paypal: { type: Boolean, default: false },
      applePay: { type: Boolean, default: false },
      googlePay: { type: Boolean, default: false }
    }
  },
  
  // System Settings
  system: {
    enableLogging: { type: Boolean, default: true },
    logLevel: { 
      type: String, 
      default: 'info', 
      enum: ['error', 'warn', 'info', 'debug'] 
    },
    logRetentionDays: { type: Number, default: 30, min: 7, max: 365 },
    enableBackups: { type: Boolean, default: true },
    backupFrequency: { 
      type: String, 
      default: 'daily', 
      enum: ['hourly', 'daily', 'weekly', 'monthly'] 
    },
    backupRetentionDays: { type: Number, default: 30, min: 7, max: 365 },
    enableAnalytics: { type: Boolean, default: true },
    analyticsProvider: { 
      type: String, 
      default: 'google', 
      enum: ['google', 'mixpanel', 'none'] 
    },
    enableCaching: { type: Boolean, default: true },
    cacheExpirationMinutes: { type: Number, default: 60, min: 5, max: 1440 },
    enableRateLimiting: { type: Boolean, default: true },
    rateLimitRequestsPerMinute: { type: Number, default: 100, min: 10, max: 1000 },
    databaseMaintenanceTime: { type: String, default: '02:00' }
  },
  
  // User Preferences
  preferences: {
    theme: { 
      type: String, 
      default: 'system', 
      enum: ['light', 'dark', 'system'] 
    },
    language: { type: String, default: 'en' },
    dateFormat: { 
      type: String, 
      default: 'MM/DD/YYYY', 
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] 
    },
    timeFormat: { 
      type: String, 
      default: '12h', 
      enum: ['12h', '24h'] 
    },
    showWelcomeMessage: { type: Boolean, default: true },
    enableDesktopNotifications: { type: Boolean, default: true },
    autoSaveInterval: { type: Number, default: 30, min: 10, max: 300 }, // seconds
    defaultPageSize: { type: Number, default: 20, min: 10, max: 100 },
    enableHotkeys: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  collection: 'adminSettings'
});

// Index for efficient category lookups
AdminSettingsSchema.index({ category: 1 });

// Virtual for getting all settings as a single object
AdminSettingsSchema.virtual('allSettings').get(function() {
  return {
    general: this.general,
    email: this.email,
    security: this.security,
    booking: this.booking,
    payment: this.payment,
    system: this.system,
    preferences: this.preferences
  };
});

// Static method to get default settings for a category
AdminSettingsSchema.statics.getDefaults = function(category) {
  const defaults = {
    general: {
      siteName: 'StudioPro Management',
      siteDescription: 'Professional photography studio management system',
      contactEmail: 'admin@studiopro.com',
      contactPhone: '+1 (555) 123-4567',
      businessHours: {
        start: '09:00',
        end: '18:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      timezone: 'UTC',
      currency: 'USD',
      taxRate: 10,
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromName: 'StudioPro',
      fromEmail: 'noreply@studiopro.com',
      enableEmailNotifications: true,
      enableBookingConfirmations: true,
      enablePaymentNotifications: true,
      enableRefundNotifications: true,
      enableReminderEmails: true,
      reminderHoursBefore: 24
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      requirePasswordChange: false,
      passwordChangeInterval: 90,
      enableTwoFactor: false,
      minPasswordLength: 8,
      requireSpecialChars: true,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      maxFileSize: 10,
      ipWhitelist: []
    },
    booking: {
      bookingWindowDays: 90,
      minAdvanceBookingHours: 24,
      maxAdvanceBookingDays: 365,
      allowSameDayBooking: false,
      autoConfirmBookings: false,
      requireDepositPercentage: 25,
      cancellationDeadlineHours: 48,
      refundProcessingDays: 5,
      overduePaymentGraceDays: 3,
      reminderEmailDays: [7, 3, 1],
      allowBookingModification: true,
      maxRescheduleCount: 2
    },
    payment: {
      enableStripe: false,
      enablePayPal: false,
      enableCashPayments: true,
      enableBankTransfer: true,
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalSecret: '',
      processingFeePercentage: 2.9,
      processingFeeFixed: 0.30,
      paymentMethods: {
        creditCard: true,
        debitCard: true,
        bankTransfer: true,
        cash: true,
        paypal: false,
        applePay: false,
        googlePay: false
      }
    },
    system: {
      enableLogging: true,
      logLevel: 'info',
      logRetentionDays: 30,
      enableBackups: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      enableAnalytics: true,
      analyticsProvider: 'google',
      enableCaching: true,
      cacheExpirationMinutes: 60,
      enableRateLimiting: true,
      rateLimitRequestsPerMinute: 100,
      databaseMaintenanceTime: '02:00'
    },
    preferences: {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      showWelcomeMessage: true,
      enableDesktopNotifications: true,
      autoSaveInterval: 30,
      defaultPageSize: 20,
      enableHotkeys: true
    }
  };
  
  return defaults[category] || {};
};

// Static method to initialize default settings
AdminSettingsSchema.statics.initializeDefaults = async function() {
  const categories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
  
  for (const category of categories) {
    const existing = await this.findOne({ category });
    if (!existing) {
      const defaults = this.getDefaults(category);
      await this.create({
        category,
        [category]: defaults
      });
    }
  }
};

// Method to merge and validate settings
AdminSettingsSchema.methods.mergeSettings = function(newSettings) {
  if (this.category && newSettings) {
    // Merge new settings with existing ones
    this[this.category] = { ...this[this.category], ...newSettings };
  }
  return this;
};

export default mongoose.model('AdminSettings', AdminSettingsSchema);