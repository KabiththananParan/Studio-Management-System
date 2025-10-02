import express from "express";
import User from "../models/User.js";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";
import InventoryBooking from "../models/InventoryBooking.js";
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
      verifiedUsersCount,
      inventoryBookingsStats,
      recentInventoryBookings
    ] = await Promise.all([
      User.countDocuments(),
      Package.countDocuments(),
      Booking.getStats(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerInfo.name packageName totalAmount bookingStatus createdAt'),
      Package.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true }),
      InventoryBooking.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$pricing.total", 0]
              }
            },
            pendingBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "Pending"] }, 1, 0]
              }
            },
            confirmedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0]
              }
            },
            completedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "Completed"] }, 1, 0]
              }
            },
            cancelledBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0]
              }
            }
          }
        }
      ]).then(result => result[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
      }),
      InventoryBooking.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('bookingId customerInfo.name pricing.total status createdAt')
    ]);

    // Calculate additional statistics
    const totalRevenue = bookingsStats.totalRevenue || 0;
    const completedBookings = bookingsStats.completedBookings || 0;
    const pendingBookings = bookingsStats.pendingPayments || 0;
    
    // Calculate combined statistics
    const totalCombinedRevenue = totalRevenue + (inventoryBookingsStats.totalRevenue || 0);
    const totalCombinedBookings = (bookingsStats.totalBookings || 0) + (inventoryBookingsStats.totalBookings || 0);

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
        total: totalCombinedBookings,
        completed: completedBookings + (inventoryBookingsStats.completedBookings || 0),
        cancelled: (bookingsStats.cancelledBookings || 0) + (inventoryBookingsStats.cancelledBookings || 0),
        pending: pendingBookings + (inventoryBookingsStats.pendingBookings || 0),
        studio: {
          total: bookingsStats.totalBookings || 0,
          completed: completedBookings,
          pending: pendingBookings
        },
        inventory: {
          total: inventoryBookingsStats.totalBookings || 0,
          completed: inventoryBookingsStats.completedBookings || 0,
          pending: inventoryBookingsStats.pendingBookings || 0,
          confirmed: inventoryBookingsStats.confirmedBookings || 0
        }
      },
      revenue: {
        total: totalCombinedRevenue,
        studio: totalRevenue,
        inventory: inventoryBookingsStats.totalRevenue || 0,
        averageBookingValue: totalCombinedBookings > 0 ? 
          Math.round(totalCombinedRevenue / totalCombinedBookings) : 0
      },
      recentActivity: [
        ...recentBookings.map(booking => ({
          id: booking._id,
          type: 'studio',
          customerName: booking.customerInfo.name,
          service: booking.packageName,
          amount: booking.totalAmount,
          status: booking.bookingStatus,
          date: booking.createdAt
        })),
        ...recentInventoryBookings.map(booking => ({
          id: booking._id,
          type: 'inventory',
          customerName: booking.customerInfo.name,
          service: `Equipment Rental (${booking.bookingId})`,
          amount: booking.pricing.total,
          status: booking.status,
          date: booking.createdAt
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
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