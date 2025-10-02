import InventoryBooking from '../models/InventoryBooking.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all user's inventory bookings
export const getUserInventoryBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { 
      user: req.user.id,
      isActive: true
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bookings, total] = await Promise.all([
      InventoryBooking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.inventory', 'name brand model category images rental')
        .populate('user', 'name email')
        .lean(),
      InventoryBooking.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: bookings.length,
          totalBookings: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user inventory bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory bookings'
    });
  }
};

// Get single inventory booking
export const getInventoryBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await InventoryBooking.findOne({ 
      _id: id, 
      user: req.user.id,
      isActive: true 
    })
      .populate('items.inventory', 'name brand model category images rental specifications')
      .populate('user', 'name email phone')
      .populate('checkoutDetails.checkedOutBy', 'name')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Inventory booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching inventory booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory booking'
    });
  }
};

// Get available inventory for rental
export const getAvailableInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = { 
      isActive: true,
      status: 'Available',
      condition: { $ne: 'Needs Repair' },
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter['rental.dailyRate'] = {};
      if (minPrice) filter['rental.dailyRate'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['rental.dailyRate'].$lte = parseFloat(maxPrice);
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name brand model category images rental condition availableQuantity description tags')
        .lean(),
      Inventory.countDocuments(filter)
    ]);

    // If date range provided, filter out items that are booked
    let availableItems = items;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const bookedItemsIds = await InventoryBooking.distinct('items.inventory', {
        status: { $nin: ['Cancelled', 'Completed'] },
        'bookingDates.startDate': { $lte: end },
        'bookingDates.endDate': { $gte: start }
      });
      
      availableItems = items.filter(item => 
        !bookedItemsIds.some(bookedId => bookedId.toString() === item._id.toString())
      );
    }

    res.json({
      success: true,
      data: {
        items: availableItems,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: availableItems.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching available inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available inventory'
    });
  }
};

// Check availability for specific items and dates
export const checkAvailability = async (req, res) => {
  try {
    const { items, startDate, endDate } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const availabilityResults = [];
    
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventoryId);
      
      if (!inventory) {
        availabilityResults.push({
          inventoryId: item.inventoryId,
          available: false,
          reason: 'Item not found'
        });
        continue;
      }

      const requestedQuantity = item.quantity || 1;
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // Check basic availability
      if (!inventory.isAvailableForRental(requestedQuantity, days)) {
        availabilityResults.push({
          inventoryId: item.inventoryId,
          available: false,
          reason: 'Item not available for rental or invalid rental period',
          inventory: {
            name: inventory.name,
            availableQuantity: inventory.availableQuantity,
            minDays: inventory.rental?.minimumRentalDays,
            maxDays: inventory.rental?.maximumRentalDays
          }
        });
        continue;
      }

      // Check for booking conflicts
      const conflicts = await InventoryBooking.checkAvailability(item.inventoryId, start, end);
      const bookedQuantity = conflicts.reduce((total, booking) => {
        const bookedItem = booking.items.find(i => i.inventory.toString() === item.inventoryId);
        return total + (bookedItem ? bookedItem.quantity : 0);
      }, 0);
      
      const availableForPeriod = inventory.availableQuantity - bookedQuantity;
      
      if (availableForPeriod < requestedQuantity) {
        availabilityResults.push({
          inventoryId: item.inventoryId,
          available: false,
          reason: 'Insufficient quantity available for selected dates',
          inventory: {
            name: inventory.name,
            totalQuantity: inventory.quantity,
            availableQuantity: inventory.availableQuantity,
            bookedQuantity,
            availableForPeriod
          }
        });
      } else {
        const pricing = inventory.calculateRentalCost(days, requestedQuantity);
        availabilityResults.push({
          inventoryId: item.inventoryId,
          available: true,
          inventory: {
            name: inventory.name,
            brand: inventory.brand,
            model: inventory.model,
            availableQuantity: availableForPeriod
          },
          pricing: {
            dailyRate: pricing.daily,
            totalCost: pricing.total,
            deposit: pricing.deposit,
            days
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        availability: availabilityResults,
        period: {
          startDate: start,
          endDate: end,
          days: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
        }
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
};

// Create inventory booking
export const createInventoryBooking = async (req, res) => {
  try {
    const {
      items,
      startDate,
      endDate,
      customerInfo,
      notes
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Validate dates
    if (start <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be in the future'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Process and validate each item
    const bookingItems = [];
    let subtotal = 0;

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventoryId);
      
      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: `Inventory item not found: ${item.inventoryId}`
        });
      }

      const requestedQuantity = item.quantity || 1;
      
      // Check availability
      if (!inventory.isAvailableForRental(requestedQuantity, days)) {
        return res.status(400).json({
          success: false,
          message: `Item "${inventory.name}" is not available for the requested quantity or duration`
        });
      }

      // Check for conflicts
      const conflicts = await InventoryBooking.checkAvailability(item.inventoryId, start, end);
      const bookedQuantity = conflicts.reduce((total, booking) => {
        const bookedItem = booking.items.find(i => i.inventory.toString() === item.inventoryId);
        return total + (bookedItem ? bookedItem.quantity : 0);
      }, 0);
      
      if (inventory.availableQuantity - bookedQuantity < requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity available for "${inventory.name}" during selected dates`
        });
      }

      // Calculate pricing
      const pricing = inventory.calculateRentalCost(days, requestedQuantity);
      const itemSubtotal = pricing.total;
      
      bookingItems.push({
        inventory: inventory._id,
        quantity: requestedQuantity,
        dailyRate: pricing.daily,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
    }

    // Calculate tax (assume 10% VAT)
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    // Create the booking
    const booking = new InventoryBooking({
      user: req.user.id,
      items: bookingItems,
      bookingDates: {
        startDate: start,
        endDate: end,
        duration: days
      },
      customerInfo,
      pricing: {
        subtotal,
        tax,
        discount: 0,
        total
      },
      notes: {
        userNotes: notes?.userNotes || '',
        specialRequirements: notes?.specialRequirements || ''
      },
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    await booking.save();

    // Populate the created booking
    const populatedBooking = await InventoryBooking.findById(booking._id)
      .populate('items.inventory', 'name brand model category images rental')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Inventory booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating inventory booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inventory booking'
    });
  }
};

// Update inventory booking
export const updateInventoryBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    // Find the booking
    const booking = await InventoryBooking.findOne({ 
      _id: id, 
      user: req.user.id,
      isActive: true 
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be updated
    if (['Checked Out', 'In Use', 'Returned', 'Completed', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be updated in current status'
      });
    }

    // Only allow updates to specific fields
    const allowedUpdates = ['customerInfo', 'notes'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field]) {
        updates[field] = updateData[field];
      }
    });

    const updatedBooking = await InventoryBooking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('items.inventory', 'name brand model category images rental')
     .populate('user', 'name email');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating inventory booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory booking'
    });
  }
};

// Cancel inventory booking
export const cancelInventoryBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await InventoryBooking.findOne({ 
      _id: id, 
      user: req.user.id,
      isActive: true 
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled. Cancellation is only allowed 24+ hours before start date.'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefundAmount();

    // Update booking
    booking.cancellation = {
      cancelled: true,
      cancelledBy: req.user.id,
      cancelledByModel: 'User',
      cancellationDate: new Date(),
      reason: reason || 'Cancelled by user',
      refundAmount,
      refundStatus: refundAmount > 0 ? 'Pending' : 'Processed'
    };
    booking.status = 'Cancelled';

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking.bookingId,
        refundAmount,
        refundStatus: booking.cancellation.refundStatus
      }
    });
  } catch (error) {
    console.error('Error cancelling inventory booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling inventory booking'
    });
  }
};

// Get user booking statistics
export const getUserBookingStats = async (req, res) => {
  try {
    const stats = await InventoryBooking.getBookingStats(req.user.id);
    
    // Get recent bookings
    const recentBookings = await InventoryBooking.find({ 
      user: req.user.id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.inventory', 'name brand model category')
      .select('bookingId status pricing.total bookingDates createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        stats,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error fetching user booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics'
    });
  }
};