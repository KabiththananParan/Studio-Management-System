import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import InventoryBooking from "../models/InventoryBooking.js";
import Review from "../models/Review.js";
import Complaint from "../models/Complaint.js";
import Refund from "../models/Refund.js";
import Notification from "../models/Notification.js";
import SlotRequest from "../models/SlotRequest.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get admin notifications
router.get("/notifications", protect, admin, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    // Get recent activities for notifications
    const [
      newUsers,
      recentBookings,
      recentInventoryBookings,
      recentReviews,
      recentComplaints,
      recentRefunds,
      recentSlotRequests
    ] = await Promise.all([
      // New user registrations (last 7 days)
      User.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt isVerified'),

      // Recent studio bookings (last 3 days)
      Booking.find({
        createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerInfo.name packageName bookingStatus totalAmount createdAt bookingId paymentStatus'),

      // Recent inventory bookings (last 3 days)
      InventoryBooking.find({
        createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerInfo.name items status pricing.total createdAt bookingId paymentStatus'),

      // Recent reviews (last 5 days)
      Review.find({
        createdAt: { $gte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerName rating comment createdAt bookingId'),

      // Recent complaints (last 10 days)
      Complaint.find({
        createdAt: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerName subject status createdAt priority'),

      // Recent refund requests (last 15 days)
      Refund.find({
        createdAt: { $gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerName amount status reason createdAt bookingId'),

      // Recent slot requests (last 10 days)
      SlotRequest.find({
        createdAt: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('packageName preferredDate status note contact createdAt')
    ]);

    // Get read notifications for this admin
    const adminId = new mongoose.Types.ObjectId(req.user.id);
    const readNotifications = await Notification.find({ adminId });
    const readNotificationIds = new Set(readNotifications.map(n => n.notificationId));

    // Transform data into notification format
    const notifications = [];

    // Add new user notifications
    newUsers.forEach(user => {
      const notificationId = `user_${user._id}`;
      notifications.push({
        id: notificationId,
        type: 'new_user',
        title: 'New User Registration',
        message: `${user.name} has created a new account`,
        details: {
          email: user.email,
          verified: user.isVerified
        },
        timestamp: user.createdAt,
        icon: '👤',
        color: 'blue',
        priority: 'medium',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add studio booking notifications
    recentBookings.forEach(booking => {
      let notificationType = 'studio_booking';
      let message = `${booking.customerInfo.name} made a studio booking`;
      let icon = '📸';
      
      if (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') {
        notificationType = 'studio_payment';
        message = `Payment received for studio booking by ${booking.customerInfo.name}`;
        icon = '💳';
      }

      const notificationId = `booking_${booking._id}`;
      notifications.push({
        id: notificationId,
        type: notificationType,
  title: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'Studio Payment Received' : 'New Studio Booking',
        message,
        details: {
          bookingId: booking.bookingId,
          package: booking.packageName,
          amount: booking.totalAmount,
          status: booking.bookingStatus,
          paymentStatus: booking.paymentStatus
        },
        timestamp: booking.createdAt,
        icon,
        color: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'green' : 'purple',
        priority: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'high' : 'medium',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add inventory booking notifications
    recentInventoryBookings.forEach(booking => {
      let notificationType = 'inventory_booking';
      let message = `${booking.customerInfo.name} made an equipment rental`;
      let icon = '📦';
      
      if (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') {
        notificationType = 'inventory_payment';
        message = `Payment received for equipment rental by ${booking.customerInfo.name}`;
        icon = '💰';
      }

      const notificationId = `inventory_${booking._id}`;
      notifications.push({
        id: notificationId,
        type: notificationType,
  title: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'Rental Payment Received' : 'New Equipment Rental',
        message,
        details: {
          bookingId: booking.bookingId,
          items: booking.items?.length || 0,
          amount: booking.pricing?.total,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        },
        timestamp: booking.createdAt,
        icon,
        color: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'green' : 'indigo',
        priority: (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'completed') ? 'high' : 'medium',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add review notifications
    recentReviews.forEach(review => {
      const notificationId = `review_${review._id}`;
      notifications.push({
        id: notificationId,
        type: 'new_review',
        title: 'New Customer Review',
        message: `${review.customerName} left a ${review.rating}-star review`,
        details: {
          rating: review.rating,
          comment: review.comment,
          bookingId: review.bookingId
        },
        timestamp: review.createdAt,
        icon: '⭐',
        color: 'yellow',
        priority: 'low',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add complaint notifications
    recentComplaints.forEach(complaint => {
      const notificationId = `complaint_${complaint._id}`;
      notifications.push({
        id: notificationId,
        type: 'new_complaint',
        title: 'New Customer Complaint',
        message: `${complaint.customerName} submitted a complaint: ${complaint.subject}`,
        details: {
          subject: complaint.subject,
          status: complaint.status,
          priority: complaint.priority
        },
        timestamp: complaint.createdAt,
        icon: '⚠️',
        color: 'red',
        priority: complaint.priority === 'High' ? 'high' : 'medium',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add refund notifications
    recentRefunds.forEach(refund => {
      const notificationId = `refund_${refund._id}`;
      notifications.push({
        id: notificationId,
        type: 'refund_request',
        title: 'New Refund Request',
        message: `${refund.customerName} requested a refund of LKR ${refund.amount}`,
        details: {
          bookingId: refund.bookingId,
          amount: refund.amount,
          reason: refund.reason,
          status: refund.status
        },
        timestamp: refund.createdAt,
        icon: '💸',
        color: 'orange',
        priority: 'high',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Add slot request notifications
    recentSlotRequests.forEach(reqDoc => {
      const notificationId = `slotreq_${reqDoc._id}`;
      notifications.push({
        id: notificationId,
        type: 'slot_request',
        title: 'New Slot Request',
        message: `${reqDoc.contact?.name || 'A user'} requested a slot for ${reqDoc.packageName}`,
        details: {
          package: reqDoc.packageName,
          preferredDate: reqDoc.preferredDate,
          status: reqDoc.status,
          note: reqDoc.note,
          contact: reqDoc.contact
        },
        timestamp: reqDoc.createdAt,
        icon: '🗓️',
        color: 'cyan',
        priority: 'medium',
        isRead: readNotificationIds.has(notificationId)
      });
    });

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const paginatedNotifications = notifications.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    // Get counts by type for summary (only unread notifications)
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const notificationCounts = {
      total: unreadNotifications.length,
      new_users: unreadNotifications.filter(n => n.type === 'new_user').length,
      bookings: unreadNotifications.filter(n => n.type.includes('booking')).length,
      payments: unreadNotifications.filter(n => n.type.includes('payment')).length,
      reviews: unreadNotifications.filter(n => n.type === 'new_review').length,
      complaints: unreadNotifications.filter(n => n.type === 'new_complaint').length,
      refunds: unreadNotifications.filter(n => n.type === 'refund_request').length,
      slot_requests: unreadNotifications.filter(n => n.type === 'slot_request').length,
      high_priority: unreadNotifications.filter(n => n.priority === 'high').length
    };

    res.json({
      notifications: paginatedNotifications,
      counts: notificationCounts,
      hasMore: notifications.length > parseInt(skip) + parseInt(limit)
    });

  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", protect, admin, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    // Check if notification already marked as read
    const existingNotification = await Notification.findOne({
      notificationId,
      adminId
    });

    if (!existingNotification) {
      // Determine the source collection and type based on notification ID
      let notificationType, sourceCollection, sourceId;
      
      if (notificationId.startsWith('user_')) {
        notificationType = 'user';
        sourceCollection = 'users';
        sourceId = notificationId.replace('user_', '');
      } else if (notificationId.startsWith('booking_')) {
        notificationType = 'booking';
        sourceCollection = 'bookings';
        sourceId = notificationId.replace('booking_', '');
      } else if (notificationId.startsWith('inventory_')) {
        notificationType = 'inventory_booking';
        sourceCollection = 'inventorybookings';
        sourceId = notificationId.replace('inventory_', '');
      } else if (notificationId.startsWith('review_')) {
        notificationType = 'review';
        sourceCollection = 'reviews';
        sourceId = notificationId.replace('review_', '');
      } else if (notificationId.startsWith('complaint_')) {
        notificationType = 'complaint';
        sourceCollection = 'complaints';
        sourceId = notificationId.replace('complaint_', '');
      } else if (notificationId.startsWith('refund_')) {
        notificationType = 'refund';
        sourceCollection = 'refunds';
        sourceId = notificationId.replace('refund_', '');
      } else if (notificationId.startsWith('slotreq_')) {
        notificationType = 'slot_request';
        sourceCollection = 'slotrequests';
        sourceId = notificationId.replace('slotreq_', '');
      } else {
        console.warn(`Unknown notification ID format: ${notificationId}`);
        return res.json({ message: "Notification marked as read" });
      }

      // Create new notification read record
      const notification = new Notification({
        notificationId,
        adminId,
        notificationType,
        sourceId,
        sourceCollection
      });

      try {
        await notification.save();
      } catch (saveError) {
        if (saveError.code === 11000) {
          // Duplicate key error - notification already exists, ignore
          console.log(`Notification ${notificationId} already marked as read`);
        } else {
          console.error(`Error saving notification ${notificationId}:`, saveError);
          throw saveError;
        }
      }
    }

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    console.error("Error stack:", err.stack);
    console.error("Notification ID:", req.params.id);
    console.error("Admin ID:", req.user?.id);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", protect, admin, async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id);
    const { notificationIds } = req.body;

    // Validate input
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: "Invalid notification IDs provided" });
    }

    // Mark multiple notifications as read
    const promises = [];
    
    for (const notificationId of notificationIds) {
      try {
        // Check if already marked as read
        const existing = await Notification.findOne({ notificationId, adminId });
        
        if (!existing) {
          // Determine the source collection and type based on notification ID
          let notificationType, sourceCollection, sourceId;
          
          if (notificationId.startsWith('user_')) {
            notificationType = 'user';
            sourceCollection = 'users';
            sourceId = notificationId.replace('user_', '');
          } else if (notificationId.startsWith('booking_')) {
            notificationType = 'booking';
            sourceCollection = 'bookings';
            sourceId = notificationId.replace('booking_', '');
          } else if (notificationId.startsWith('inventory_')) {
            notificationType = 'inventory_booking';
            sourceCollection = 'inventorybookings';
            sourceId = notificationId.replace('inventory_', '');
          } else if (notificationId.startsWith('review_')) {
            notificationType = 'review';
            sourceCollection = 'reviews';
            sourceId = notificationId.replace('review_', '');
          } else if (notificationId.startsWith('complaint_')) {
            notificationType = 'complaint';
            sourceCollection = 'complaints';
            sourceId = notificationId.replace('complaint_', '');
          } else if (notificationId.startsWith('refund_')) {
            notificationType = 'refund';
            sourceCollection = 'refunds';
            sourceId = notificationId.replace('refund_', '');
          } else if (notificationId.startsWith('slotreq_')) {
            notificationType = 'slot_request';
            sourceCollection = 'slotrequests';
            sourceId = notificationId.replace('slotreq_', '');
          } else {
            console.warn(`Unknown notification ID format: ${notificationId}`);
            continue;
          }

          const notification = new Notification({
            notificationId,
            adminId,
            notificationType,
            sourceId,
            sourceCollection
          });

          promises.push(
            notification.save().catch(err => {
              if (err.code === 11000) {
                // Duplicate key error - notification already exists, ignore
                console.log(`Notification ${notificationId} already marked as read`);
                return null;
              }
              throw err;
            })
          );
        }
      } catch (error) {
        console.error(`Error processing notification ${notificationId}:`, error);
        // Continue with other notifications instead of failing completely
      }
    }

    // Only execute promises if there are any
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    console.error("Error stack:", err.stack);
    console.error("Request body:", req.body);
    console.error("Admin ID:", req.user?.id);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Clear old read notifications (cleanup)
router.delete("/notifications/cleanup", protect, admin, async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Delete read notifications older than 30 days
    const result = await Notification.deleteMany({
      adminId,
      readAt: { $lte: thirtyDaysAgo }
    });

    res.json({ 
      message: "Old notifications cleaned up",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error cleaning up notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;