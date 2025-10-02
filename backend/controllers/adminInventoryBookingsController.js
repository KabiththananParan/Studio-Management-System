import InventoryBooking from '../models/InventoryBooking.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';

// Get all inventory bookings for admin
export const getAdminInventoryBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      search, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries
    const [bookings, totalCount] = await Promise.all([
      InventoryBooking.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('items.inventory', 'name brand model category imageUrl')
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      InventoryBooking.countDocuments(filter)
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings: totalCount,
        hasNext,
        hasPrev,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin inventory bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory bookings',
      error: error.message
    });
  }
};

// Get single inventory booking details
export const getInventoryBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await InventoryBooking.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.inventory', 'name brand model category imageUrl serialNumber')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Inventory booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching inventory booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details',
      error: error.message
    });
  }
};

// Update inventory booking status
export const updateInventoryBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, adminNotes } = req.body;

    const booking = await InventoryBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Inventory booking not found'
      });
    }

    // Update fields if provided
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) {
      if (!booking.notes) {
        booking.notes = {};
      }
      booking.notes.adminNotes = adminNotes;
    }

    // Update booking status automatically based on dates
    booking.updateBookingStatus();

    await booking.save();

    // Populate the updated booking
    const updatedBooking = await InventoryBooking.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('items.inventory', 'name brand model category');

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Cancel inventory booking (admin)
export const cancelInventoryBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await InventoryBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Inventory booking not found'
      });
    }

    // Admin can cancel any booking except those already cancelled or completed
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    // Update booking status
    booking.status = 'Cancelled';
    if (!booking.notes) {
      booking.notes = {};
    }
    booking.notes.adminNotes = reason || 'Cancelled by admin';

    // Update timeline
    if (!booking.timeline) {
      booking.timeline = {};
    }
    booking.timeline.cancelledDate = new Date();

    await booking.save();

    // Populate the cancelled booking for response
    const cancelledBooking = await InventoryBooking.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('items.inventory', 'name brand model category');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Get inventory bookings statistics
export const getInventoryBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get basic stats
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      paidBookings
    ] = await Promise.all([
      InventoryBooking.countDocuments(dateFilter),
      InventoryBooking.countDocuments({ ...dateFilter, status: 'Pending' }),
      InventoryBooking.countDocuments({ ...dateFilter, status: 'Confirmed' }),
      InventoryBooking.countDocuments({ ...dateFilter, status: 'Completed' }),
      InventoryBooking.countDocuments({ ...dateFilter, status: 'Cancelled' }),
      InventoryBooking.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      InventoryBooking.countDocuments({ ...dateFilter, paymentStatus: 'Paid' })
    ]);

    // Get bookings by status for chart
    const statusBreakdown = await InventoryBooking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get revenue by month
    const monthlyRevenue = await InventoryBooking.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get popular inventory items
    const popularItems = await InventoryBooking.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.inventory',
          bookings: { $sum: 1 },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: '$item.name',
          brand: '$item.brand',
          model: '$item.model',
          category: '$item.category',
          bookings: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Average booking value
    const avgBookingValue = totalRevenue[0]?.total ? 
      (totalRevenue[0].total / paidBookings) : 0;

    res.status(200).json({
      success: true,
      stats: {
        overview: {
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          avgBookingValue: Math.round(avgBookingValue * 100) / 100
        },
        charts: {
          statusBreakdown,
          monthlyRevenue,
          popularItems
        }
      }
    });

  } catch (error) {
    console.error('Error fetching inventory booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics',
      error: error.message
    });
  }
};

// Get overdue bookings
export const getOverdueBookings = async (req, res) => {
  try {
    const now = new Date();
    
    const overdueBookings = await InventoryBooking.find({
      status: 'Confirmed',
      'bookingDates.endDate': { $lt: now }
    })
    .populate('user', 'firstName lastName email phone')
    .populate('items.inventory', 'name brand model serialNumber')
    .sort({ 'bookingDates.endDate': 1 })
    .lean();

    res.status(200).json({
      success: true,
      bookings: overdueBookings,
      count: overdueBookings.length
    });

  } catch (error) {
    console.error('Error fetching overdue bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue bookings',
      error: error.message
    });
  }
};

// Export inventory bookings
export const exportInventoryBookings = async (req, res) => {
  try {
    const { format = 'json', ...filters } = req.query;

    // Build filter (reuse logic from getAdminInventoryBookings)
    const filter = {};
    
    if (filters.status && filters.status !== 'all') {
      filter.status = filters.status;
    }
    
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filter.paymentStatus = filters.paymentStatus;
    }

    if (filters.startDate || filters.endDate) {
      filter.createdAt = {};
      if (filters.startDate) filter.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.createdAt.$lte = new Date(filters.endDate);
    }

    // Get all bookings without pagination
    const bookings = await InventoryBooking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('items.inventory', 'name brand model category serialNumber')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = bookings.map(booking => ({
        'Booking ID': booking.bookingId,
        'Customer Name': booking.customerInfo.name,
        'Customer Email': booking.customerInfo.email,
        'Customer Phone': booking.customerInfo.phone,
        'Items': booking.items.map(item => `${item.inventory.name} (${item.quantity}x)`).join(', '),
        'Start Date': booking.bookingDates.startDate.toISOString().split('T')[0],
        'End Date': booking.bookingDates.endDate.toISOString().split('T')[0],
        'Duration': booking.bookingDates.duration,
        'Status': booking.status,
        'Payment Status': booking.paymentStatus,
        'Total Amount': booking.pricing.total,
        'Created At': booking.createdAt.toISOString().split('T')[0]
      }));

      // Convert to CSV string
      const csvHeader = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      );
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory-bookings.csv"');
      return res.send(csvContent);
    }

    // JSON format
    res.status(200).json({
      success: true,
      data: bookings,
      exportedAt: new Date(),
      totalRecords: bookings.length
    });

  } catch (error) {
    console.error('Error exporting inventory bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting bookings',
      error: error.message
    });
  }
};

export default {
  getAdminInventoryBookings,
  getInventoryBookingDetails,
  updateInventoryBookingStatus,
  cancelInventoryBooking,
  getInventoryBookingStats,
  getOverdueBookings,
  exportInventoryBookings
};