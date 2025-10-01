import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "../services/emailService.js";

// @desc    Create a new booking
// @route   POS// @desc    Update payment status
// @route   PATCH /api/user/bookings/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;

    // Validate input
    if (!paymentStatus || !['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: "Valid payment status is required" });
    }

    // Find the booking and verify ownership
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    // Update payment status
    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }

    await booking.save();

    // Send payment confirmation email if payment is completed
    if (paymentStatus === 'completed') {
      try {
        await sendPaymentConfirmationEmail(booking);
        console.log(`📧 Payment confirmation email sent for booking: ${booking.bookingReference}`);
      } catch (emailError) {
        console.error('📧 Payment confirmation email failed:', emailError);
        // Don't fail the payment update if email fails
      }
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      booking: {
        _id: booking._id,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId
      }
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/user/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking and verify ownership
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({ 
        message: "Booking cannot be cancelled (less than 24 hours before booking time or not confirmed)" 
      });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Update slot availability
    await Slot.findByIdAndUpdate(booking.slotId, {
      status: 'available',
      isAvailable: true,
      bookingId: null
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: {
        _id: booking._id,
        bookingStatus: booking.bookingStatus
      }
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new booking
// @route   POST /api/user/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    console.log("=== Booking Creation Request ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user?.id);
    
    const {
      packageId,
      slotId,
      customerInfo,
      paymentMethod,
      specialRequests
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

    // Check if slot is not in the past
    const now = new Date();
    const slotDateTime = new Date(`${slot.date.toDateString()} ${slot.startTime}`);
    if (slotDateTime <= now) {
      return res.status(400).json({ message: "Cannot book slots in the past" });
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
      paymentStatus: 'pending',
      bookingStatus: 'confirmed',
      specialRequests: specialRequests || "",
      notes: `Booking created for ${customerInfo.name}`,
      userId: req.user.id // Link to authenticated user
    });

    await booking.save();

    // Update slot status to booked
    await Slot.findByIdAndUpdate(slotId, {
      status: 'booked',
      isAvailable: false,
      bookingId: booking._id
    });

    // Populate package info for response
    await booking.populate('packageId', 'name description features');

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail(booking, packageDoc, slot);
      console.log(`📧 Booking confirmation email sent for booking: ${booking.bookingReference}`);
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        customerInfo: booking.customerInfo,
        package: {
          name: booking.packageName,
          price: booking.packagePrice
        },
        slot: {
          date: booking.bookingDate,
          time: booking.bookingTime,
          price: booking.slotPrice
        },
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/user/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter
    const filter = {};
    
    // If user is authenticated, filter by user ID or email
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        filter.$or = [
          { userId: req.user.id },
          { 'customerInfo.email': user.email }
        ];
      }
    }

    // Filter by status if provided
    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter)
      .populate('packageId', 'name description features image')
      .populate('slotId', 'date startTime endTime price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingReference: booking.bookingReference,
      customerInfo: booking.customerInfo,
      package: {
        _id: booking.packageId?._id,
        name: booking.packageName,
        price: booking.packagePrice,
        image: booking.packageId?.image,
        features: booking.packageId?.features
      },
      slot: {
        _id: booking.slotId?._id,
        date: booking.bookingDate,
        time: booking.bookingTime,
        price: booking.slotPrice,
        formattedDate: booking.formattedBookingDate,
        startTime: booking.slotId?.startTime,
        endTime: booking.slotId?.endTime
      },
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      specialRequests: booking.specialRequests,
      canBeCancelled: booking.canBeCancelled(),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get specific booking details
// @route   GET /api/user/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('packageId', 'name description features image')
      .populate('slotId', 'startTime endTime date price');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user has access to this booking
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      const hasAccess = booking.userId?.toString() === req.user.id || 
                       (user && booking.customerInfo.email === user.email);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this booking" });
      }
    }

    const formattedBooking = {
      _id: booking._id,
      bookingReference: booking.bookingReference,
      customerInfo: booking.customerInfo,
      package: {
        _id: booking.packageId?._id,
        name: booking.packageName,
        description: booking.packageId?.description,
        price: booking.packagePrice,
        image: booking.packageId?.image,
        features: booking.packageId?.features
      },
      slot: {
        _id: booking.slotId?._id,
        date: booking.bookingDate,
        time: booking.bookingTime,
        price: booking.slotPrice,
        formattedDate: booking.formattedBookingDate,
        duration: booking.duration
      },
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      specialRequests: booking.specialRequests,
      notes: booking.notes,
      canBeCancelled: booking.canBeCancelled(),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    res.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update booking details
// @route   PUT /api/user/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerInfo, slot } = req.body;

    // Find the booking and verify ownership
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    // Check if booking can be updated (not cancelled or completed)
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: "Cannot update a cancelled booking" });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ message: "Cannot update a completed booking" });
    }

    // Update customer information if provided
    if (customerInfo) {
      if (customerInfo.name) booking.customerInfo.name = customerInfo.name;
      if (customerInfo.email) booking.customerInfo.email = customerInfo.email;
      if (customerInfo.phone) booking.customerInfo.phone = customerInfo.phone;
    }

    // Update slot information if provided
    if (slot) {
      if (slot.date) booking.slot.date = new Date(slot.date);
      if (slot.time) booking.slot.time = slot.time;
    }

    // Update the updated timestamp
    booking.updatedAt = new Date();

    // Save the updated booking
    await booking.save();

    // Return the updated booking with populated fields
    const updatedBooking = await Booking.findById(booking._id)
      .populate('packageId', 'name price description features')
      .populate('slotId', 'date startTime endTime')
      .populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: {
        _id: updatedBooking._id,
        customerInfo: updatedBooking.customerInfo,
        slot: updatedBooking.slot,
        package: updatedBooking.packageId,
        totalAmount: updatedBooking.totalAmount,
        paymentStatus: updatedBooking.paymentStatus,
        bookingStatus: updatedBooking.bookingStatus,
        paymentMethod: updatedBooking.paymentMethod,
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/user/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking and verify ownership
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this booking" });
    }

    // Check if booking can be deleted (only pending or confirmed bookings that haven't been paid)
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ 
        message: "Cannot delete a completed booking. Please contact support if needed." 
      });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ 
        message: "Cannot delete a booking with completed payment. Please use cancellation instead." 
      });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



