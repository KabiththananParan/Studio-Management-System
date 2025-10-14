import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // Unique identifier for the notification
  notificationId: {
    type: String,
    required: true
  },
  
  // Which admin read this notification
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  
  // Type of notification for categorization
  notificationType: {
    type: String,
    required: true,
    enum: ['user', 'booking', 'inventory_booking', 'payment', 'review', 'complaint', 'refund']
  },
  
  // When the notification was marked as read
  readAt: {
    type: Date,
    default: Date.now
  },
  
  // Reference to the source document
  sourceId: {
    type: String,
    required: true
  },
  
  // Source collection name
  sourceCollection: {
    type: String,
    required: true,
    enum: ['users', 'bookings', 'inventorybookings', 'reviews', 'complaints', 'refunds']
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
notificationSchema.index({ adminId: 1, notificationType: 1 });
// Unique compound index - same notification can be read by different admins
notificationSchema.index({ notificationId: 1, adminId: 1 }, { unique: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;