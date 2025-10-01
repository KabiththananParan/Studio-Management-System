import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, packageId, search } = req.query;
    
    let filter = {};
    
    // Filter by booking status
    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }
    
    // Filter by package
    if (packageId && packageId !== 'all') {
      filter.packageId = packageId;
    }
    
    // Search by customer name or email or booking reference
    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('packageId', 'name price duration')
      .populate('slotId', 'date startTime endTime')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create new booking as admin
// @route   POST /api/admin/bookings
// @access  Private/Admin
export const createBookingAsAdmin = async (req, res) => {
  try {
    console.log("=== Admin Booking Creation Request ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const {
      packageId,
      slotId,
      customerInfo,
      paymentMethod,
      paymentStatus,
      specialRequests,
      userId // Optional - if booking for registered user
    } = req.body;

    // Validate required fields
    if (!packageId || !slotId || !customerInfo) {
      return res.status(400).json({ 
        message: "Package ID, slot ID, and customer information are required" 
      });
    }

    // Validate customer info
    const { name, email, phone, address } = customerInfo;
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ 
        message: "Complete customer information (name, email, phone, address) is required" 
      });
    }

    // Verify package exists and is active
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc || !packageDoc.isActive) {
      return res.status(404).json({ message: "Package not found or inactive" });
    }

    // Verify slot exists and is available
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    if (!slot.isAvailable || slot.status !== 'available') {
      return res.status(400).json({ message: "Selected time slot is no longer available" });
    }

    // Calculate total amount
    const totalAmount = packageDoc.price + slot.price;

    // Create booking
    const booking = new Booking({
      customerInfo: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim()
      },
      packageId: packageDoc._id,
      packageName: packageDoc.name,
      packagePrice: packageDoc.price,
      slotId: slot._id,
      bookingDate: slot.date,
      bookingTime: slot.startTime,
      duration: packageDoc.duration,
      slotPrice: slot.price,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentStatus || 'pending',
      bookingStatus: 'confirmed',
      specialRequests: specialRequests || "",
      notes: `Booking created by admin for ${customerInfo.name}`,
      userId: userId || null, // Link to user if provided
      createdBy: req.user.id // Track admin who created it
    });

    await booking.save();

    // Update slot status to booked
    await Slot.findByIdAndUpdate(slotId, {
      status: 'booked',
      isAvailable: false,
      bookingId: booking._id
    });

    // Populate for response
    await booking.populate([
      { path: 'packageId', select: 'name description features' },
      { path: 'slotId', select: 'date startTime endTime' },
      { path: 'userId', select: 'firstName lastName email' }
    ]);

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail(booking, packageDoc, slot);
      console.log(`📧 Admin-created booking confirmation email sent: ${booking.bookingReference}`);
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully by admin",
      booking
    });
  } catch (error) {
    console.error("Error creating admin booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update booking as admin
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
export const updateBookingAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Store old slot ID for cleanup
    const oldSlotId = booking.slotId;

    // If changing slot, validate new slot
    if (updateData.slotId && updateData.slotId !== oldSlotId?.toString()) {
      const newSlot = await Slot.findById(updateData.slotId);
      if (!newSlot) {
        return res.status(404).json({ message: "New time slot not found" });
      }
      
      if (!newSlot.isAvailable || newSlot.status !== 'available') {
        return res.status(400).json({ message: "New time slot is not available" });
      }

      // Update booking with new slot information
      updateData.bookingDate = newSlot.date;
      updateData.bookingTime = newSlot.startTime;
      updateData.slotPrice = newSlot.price;
      
      // Recalculate total if slot changed
      if (updateData.packagePrice) {
        updateData.totalAmount = updateData.packagePrice + newSlot.price;
      }
    }

    // If changing package, validate and update pricing
    if (updateData.packageId && updateData.packageId !== booking.packageId?.toString()) {
      const newPackage = await Package.findById(updateData.packageId);
      if (!newPackage || !newPackage.isActive) {
        return res.status(404).json({ message: "New package not found or inactive" });
      }
      
      updateData.packageName = newPackage.name;
      updateData.packagePrice = newPackage.price;
      updateData.duration = newPackage.duration;
      
      // Recalculate total
      const slotPrice = updateData.slotPrice || booking.slotPrice;
      updateData.totalAmount = newPackage.price + slotPrice;
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id, 
      { 
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      }, 
      { new: true, runValidators: true }
    ).populate([
      { path: 'packageId', select: 'name description features' },
      { path: 'slotId', select: 'date startTime endTime' },
      { path: 'userId', select: 'firstName lastName email' }
    ]);

    // Handle slot changes
    if (updateData.slotId && updateData.slotId !== oldSlotId?.toString()) {
      // Free up old slot
      if (oldSlotId) {
        await Slot.findByIdAndUpdate(oldSlotId, {
          status: 'available',
          isAvailable: true,
          bookingId: null
        });
      }
      
      // Book new slot
      await Slot.findByIdAndUpdate(updateData.slotId, {
        status: 'booked',
        isAvailable: false,
        bookingId: booking._id
      });
    }

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete booking as admin
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
export const deleteBookingAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Free up the slot if it exists
    if (booking.slotId) {
      await Slot.findByIdAndUpdate(booking.slotId, {
        status: 'available',
        isAvailable: true,
        bookingId: null
      });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Booking deleted successfully",
      deletedBookingReference: booking.bookingReference
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get booking statistics for admin
// @route   GET /api/admin/bookings/stats
// @access  Private/Admin
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const pendingPayments = await Booking.countDocuments({ paymentStatus: 'pending' });
    const completedPayments = await Booking.countDocuments({ paymentStatus: 'completed' });

    // Revenue statistics
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' }
        } 
      }
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, averageBookingValue: 0 };

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('packageId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingReference customerInfo.name packageName bookingDate createdAt bookingStatus paymentStatus');

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        pendingPayments,
        completedPayments,
        totalRevenue: revenue.totalRevenue,
        averageBookingValue: revenue.averageBookingValue,
        recentBookings
      }
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};