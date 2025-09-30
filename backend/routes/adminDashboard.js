import express from "express";
import User from "../models/User.js";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get dashboard statistics - Admin only
router.get("/stats", protect, admin, async (req, res) => {
  try {
    // Get counts in parallel for better performance
    const [
      usersCount,
      packagesCount,
      bookingsStats,
      recentBookings,
      activePackagesCount,
      verifiedUsersCount
    ] = await Promise.all([
      User.countDocuments(),
      Package.countDocuments(),
      Booking.getStats(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerInfo.name packageName totalAmount bookingStatus createdAt'),
      Package.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true })
    ]);

    // Calculate additional statistics
    const totalRevenue = bookingsStats.totalRevenue || 0;
    const completedBookings = bookingsStats.completedBookings || 0;
    const pendingBookings = bookingsStats.pendingPayments || 0;

    const stats = {
      users: {
        total: usersCount,
        verified: verifiedUsersCount,
        unverified: usersCount - verifiedUsersCount
      },
      packages: {
        total: packagesCount,
        active: activePackagesCount,
        inactive: packagesCount - activePackagesCount
      },
      bookings: {
        total: bookingsStats.totalBookings || 0,
        completed: completedBookings,
        cancelled: bookingsStats.cancelledBookings || 0,
        pending: pendingBookings
      },
      revenue: {
        total: totalRevenue,
        averageBookingValue: bookingsStats.totalBookings > 0 ? 
          Math.round(totalRevenue / bookingsStats.totalBookings) : 0
      },
      recentActivity: recentBookings.map(booking => ({
        id: booking._id,
        customerName: booking.customerInfo.name,
        packageName: booking.packageName,
        amount: booking.totalAmount,
        status: booking.bookingStatus,
        date: booking.createdAt
      }))
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error fetching dashboard statistics" });
  }
});

// Get monthly booking trends - Admin only
router.get("/trends", protect, admin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(monthlyBookings);
  } catch (err) {
    console.error("Error fetching booking trends:", err);
    res.status(500).json({ message: "Server error fetching booking trends" });
  }
});

// Get package popularity statistics - Admin only
router.get("/package-stats", protect, admin, async (req, res) => {
  try {
    const packageStats = await Booking.aggregate([
      {
        $group: {
          _id: "$packageId",
          packageName: { $first: "$packageName" },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageRating: { $avg: "$rating" } // if you add rating field later
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(packageStats);
  } catch (err) {
    console.error("Error fetching package statistics:", err);
    res.status(500).json({ message: "Server error fetching package statistics" });
  }
});

export default router;