import Booking from "../models/Booking.js";
import InventoryBooking from "../models/InventoryBooking.js";
import Package from "../models/Package.js";
import Slot from "../models/Slot.js";
import { sendPaymentConfirmationEmail } from "../services/emailService.js";

// Mock payment gateway integration - Always succeeds for development
// In production, you would integrate with real payment gateways like Stripe, PayPal, etc.
const mockPaymentGateway = {
  async processCardPayment(paymentData) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Always succeed for development purposes
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId: `pay_${Date.now()}`,
      status: 'completed',
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      gateway: 'mock_gateway',
      timestamp: new Date().toISOString()
    };
  },

  async processBankTransfer(paymentData) {
    // Always succeed for development - mark as completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      transactionId: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId: `pay_${Date.now()}`,
      status: 'completed', // Mark as completed for development
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      gateway: 'bank_transfer',
      timestamp: new Date().toISOString(),
      instructions: 'Bank transfer processed successfully (Development Mode)'
    };
  },

  async processCashPayment(paymentData) {
    // Always succeed for development - mark as completed
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      transactionId: `cash_${Date.now()}`,
      paymentId: `pay_${Date.now()}`,
      status: 'completed', // Mark as completed for development
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      gateway: 'cash',
      timestamp: new Date().toISOString(),
      instructions: 'Cash payment confirmed (Development Mode)'
    };
  }
};

// @desc    Process payment for a booking
// @route   POST /api/payments/process
// @access  Private (User must own the booking or be admin)
export const processPayment = async (req, res) => {
  try {
    console.log("=== Unified Payment Processing Request ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      bookingId,
      paymentMethod,
      paymentDetails,
      currency = 'LKR',
      bookingType // 'studio' or 'inventory'
    } = req.body;

    // Validate required fields
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and payment method are required"
      });
    }

    let booking;
    let isInventoryBooking = false;

    // Try to find studio booking first
    booking = await Booking.findById(bookingId)
      .populate('packageId', 'name price description features')
      .populate('slotId', 'date startTime endTime price')
      .populate('userId', 'firstName lastName email');

    // If not found, try inventory booking
    if (!booking) {
      booking = await InventoryBooking.findById(bookingId)
        .populate('items.inventory', 'name brand model category images rental')
        .populate('user', 'firstName lastName email');
      isInventoryBooking = true;
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if payment is already completed (handle both booking types)
    const currentPaymentStatus = isInventoryBooking ? booking.paymentStatus : booking.paymentStatus;
    if (currentPaymentStatus === 'completed' || currentPaymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this booking"
      });
    }

    // Verify user permissions (user owns booking or is admin)
    console.log("=== Authorization Check ===");
    console.log("User ID from token:", req.user?.id);
    console.log("User role:", req.user?.role);
    console.log("Booking type:", isInventoryBooking ? 'inventory' : 'studio');
    
    let isOwner = false;
    let customerInfo, userField;
    
    if (isInventoryBooking) {
      // For inventory bookings
      userField = booking.user;
      customerInfo = {
        email: booking.user?.email,
        name: `${booking.user?.firstName} ${booking.user?.lastName}`
      };
    } else {
      // For studio bookings
      userField = booking.userId;
      customerInfo = booking.customerInfo;
    }

    // Check ownership
    if (userField && req.user?.id) {
      const bookingUserId = userField._id ? userField._id.toString() : userField.toString();
      isOwner = bookingUserId === req.user.id;
      console.log("User ownership match:", isOwner);
    }
    
    const isAdmin = req.user?.role === 'admin';
    console.log("Final authorization - isOwner:", isOwner, "isAdmin:", isAdmin);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to process payment for this booking"
      });
    }

    // Prepare payment data based on booking type
    let paymentData;
    
    if (isInventoryBooking) {
      paymentData = {
        bookingId: booking._id,
        bookingReference: booking.bookingId || booking._id,
        amount: booking.pricing?.total || 0,
        currency,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        equipmentList: booking.items?.map(item => item.inventory?.name).join(', '),
        ...paymentDetails
      };
    } else {
      paymentData = {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        amount: booking.totalAmount,
        currency,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        ...paymentDetails
      };
    }

    let paymentResult;

    // Process payment based on method - Simplified for development (always succeeds)
    try {
      switch (paymentMethod.toLowerCase()) {
        case 'card':
        case 'credit_card':
        case 'debit_card':
          paymentResult = await mockPaymentGateway.processCardPayment(paymentData);
          break;

        case 'bank_transfer':
          paymentResult = await mockPaymentGateway.processBankTransfer(paymentData);
          break;

        case 'cash':
          paymentResult = await mockPaymentGateway.processCashPayment(paymentData);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Unsupported payment method"
          });
      }
      
      console.log(`💳 Payment gateway response:`, paymentResult);
      
    } catch (paymentError) {
      console.error("Payment gateway error:", paymentError);
      
      // For development, even if there's an error, we'll still process it as successful
      console.log("⚠️ Development Mode: Converting payment error to success");
      paymentResult = {
        success: true,
        transactionId: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: `pay_dev_${Date.now()}`,
        status: 'completed',
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        gateway: 'development_mode',
        timestamp: new Date().toISOString(),
        instructions: 'Payment processed in development mode'
      };
    }

    // Update booking with payment information (handle both types)
    let updatedBooking;
    
    if (isInventoryBooking) {
      // Update inventory booking
      const modelPaymentStatus = paymentResult.status === 'completed' ? 'Paid' : 'Pending';
      
      booking.paymentStatus = modelPaymentStatus;
      booking.paymentMethod = paymentMethod;
      booking.transactionId = paymentResult.transactionId;
      booking.paymentDetails = {
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.paymentId,
        gateway: paymentResult.gateway,
        timestamp: paymentResult.timestamp,
        amount: paymentResult.amount,
        currency: paymentResult.currency
      };

      // If payment is completed, update booking status
      if (paymentResult.status === 'completed') {
        booking.status = 'Confirmed';
      }

      updatedBooking = await booking.save();
      await updatedBooking.populate([
        { path: 'items.inventory', select: 'name brand model category images rental' },
        { path: 'user', select: 'firstName lastName email' }
      ]);
      
    } else {
      // Update studio booking
      updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: paymentResult.status,
          paymentMethod: paymentMethod,
          paymentDetails: {
            transactionId: paymentResult.transactionId,
            paymentId: paymentResult.paymentId,
            gateway: paymentResult.gateway,
            method: paymentMethod,
            amount: paymentResult.amount,
            currency: paymentResult.currency,
            processedAt: new Date(),
            instructions: paymentResult.instructions
          },
          ...(paymentResult.status === 'completed' && {
            bookingStatus: 'confirmed',
            paymentCompletedAt: new Date()
          })
        },
        { new: true }
      ).populate([
        { path: 'packageId', select: 'name price description features' },
        { path: 'slotId', select: 'date startTime endTime' },
        { path: 'userId', select: 'firstName lastName email' }
      ]);
    }



    // Send payment confirmation email (handle both booking types)
    try {
      if (isInventoryBooking) {
        // Send inventory booking confirmation email
        const emailData = {
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          bookingId: booking.bookingId || booking._id,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          paymentMethod: paymentMethod,
          transactionId: paymentResult.transactionId,
          equipmentList: booking.items?.map(item => item.inventory?.name).join(', ') || 'Equipment rental'
        };
        console.log('📧 Sending inventory payment confirmation email...', emailData);
        // Note: Add specific inventory email template if needed
      } else {
        // Send studio booking confirmation email
        await sendPaymentConfirmationEmail(updatedBooking);
      }
      console.log(`📧 Payment confirmation email sent successfully`);
    } catch (emailError) {
      console.error('📧 Payment email sending failed:', emailError);
      // Don't fail the payment if email fails - just log the error
      console.log('⚠️ Continuing with successful payment despite email error');
    }

    const bookingRef = isInventoryBooking ? (booking.bookingId || booking._id) : booking.bookingReference;
    console.log(`💳 Payment processed: ${paymentResult.status} - ${bookingRef}`);

    res.json({
      success: true,
      message: `${isInventoryBooking ? 'Equipment rental' : 'Studio booking'} payment completed successfully! Your booking is now confirmed.`,
      payment: {
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.paymentId,
        status: paymentResult.status,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        method: paymentMethod,
        instructions: paymentResult.instructions,
        timestamp: paymentResult.timestamp
      },
      booking: updatedBooking,
      bookingType: isInventoryBooking ? 'inventory' : 'studio'
    });

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment processing",
      error: error.message
    });
  }
};

// @desc    Verify payment status
// @route   GET /api/payments/verify/:bookingId
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('packageId', 'name price')
      .populate('slotId', 'date startTime endTime')
      .select('bookingReference paymentStatus paymentMethod paymentDetails totalAmount createdAt');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check permissions
    const isOwner = booking.userId && booking.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this payment information"
      });
    }

    res.json({
      success: true,
      payment: {
        bookingReference: booking.bookingReference,
        status: booking.paymentStatus,
        method: booking.paymentMethod,
        amount: booking.totalAmount,
        transactionId: booking.paymentDetails?.transactionId,
        paymentId: booking.paymentDetails?.paymentId,
        processedAt: booking.paymentDetails?.processedAt,
        instructions: booking.paymentDetails?.instructions
      }
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message
    });
  }
};

// @desc    Get payment methods and info
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card - Instant confirmation',
        icon: '💳',
        instantConfirmation: true,
        processingTime: 'Instant',
        fields: [
          { name: 'cardNumber', label: 'Card Number', type: 'text', required: true, maxLength: 19, placeholder: '1234 5678 9012 3456' },
          { name: 'expiryDate', label: 'Expiry Date (MM/YY)', type: 'text', required: true, maxLength: 5, placeholder: '12/25' },
          { name: 'cvv', label: 'CVV', type: 'text', required: true, maxLength: 4, placeholder: '123' },
          { name: 'cardholderName', label: 'Cardholder Name', type: 'text', required: true, placeholder: 'John Doe' }
        ]
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer - Secure and reliable payment method',
        icon: '🏦',
        instantConfirmation: true, // Changed to true for development mode
        processingTime: 'Instant (Development Mode)',
        fields: [
          { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true, placeholder: 'Your full name as per bank account' },
          { name: 'bankName', label: 'Bank Name', type: 'text', required: false, placeholder: 'Your bank name (optional)' },
          { name: 'accountNumber', label: 'Account Number', type: 'text', required: false, placeholder: 'Your account number (for reference)' },
          { name: 'phoneNumber', label: 'Contact Phone', type: 'tel', required: true, placeholder: '+94 77 123 4567 or 0771234567' }
        ],
        instructions: {
          title: 'Bank Transfer Instructions',
          details: [
            'Account Name: Studio Management System (Pvt) Ltd',
            'Account Number: 123456789012',
            'Bank: Commercial Bank of Ceylon PLC',
            'Branch: Colombo Main Branch',
            'Swift Code: CCEYLKLX',
            'Reference: Use your booking reference number',
            'Note: Transfer fees may apply as per your bank charges'
          ]
        }
      },
      {
        id: 'cash',
        name: 'Cash on Delivery (COD)',
        description: 'Pay in cash when you arrive for your photoshoot session',
        icon: '💵',
        instantConfirmation: true, // Changed to true for development mode  
        processingTime: 'On arrival (Development Mode)',
        fields: [
          { name: 'contactName', label: 'Contact Person Name', type: 'text', required: true, placeholder: 'Person who will make the payment' },
          { name: 'phoneNumber', label: 'Contact Phone', type: 'tel', required: true, placeholder: '+94 77 123 4567 or 0771234567' },
          { name: 'preferredTime', label: 'Preferred Payment Time', type: 'text', required: false, placeholder: 'e.g., Upon arrival, After session, etc.' }
        ],
        instructions: {
          title: 'Cash Payment Instructions',
          details: [
            'Please bring exact amount in Sri Lankan Rupees (LKR)',
            'Payment can be made upon arrival or after the session',
            'We accept LKR notes: 5000, 1000, 500, 100, 50, 20 denominations',
            'Official receipt will be provided for your records',
            'Contact us at +94 11 234 5678 to reschedule payment timing'
          ]
        }
      }
    ];

    res.json({
      success: true,
      paymentMethods
    });

  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching payment methods",
      error: error.message
    });
  }
};

// @desc    Admin: Manually update payment status
// @route   PUT /api/payments/admin/status/:bookingId
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update payment status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: status,
        ...(status === 'completed' && {
          bookingStatus: 'confirmed',
          paymentCompletedAt: new Date()
        }),
        $push: {
          'paymentDetails.adminNotes': {
            note: notes || `Payment status updated to ${status} by admin`,
            updatedBy: req.user.id,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate([
      { path: 'packageId', select: 'name price description features' },
      { path: 'slotId', select: 'date startTime endTime' }
    ]);

    // Send payment confirmation email if status changed to completed
    if (status === 'completed' && booking.paymentStatus !== 'completed') {
      try {
        await sendPaymentConfirmationEmail(updatedBooking, updatedBooking.packageId, updatedBooking.slotId);
        console.log(`📧 Payment confirmation email sent by admin: ${booking.bookingReference}`);
      } catch (emailError) {
        console.error('📧 Payment email sending failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating payment status",
      error: error.message
    });
  }
};

// @desc    Process payment for an inventory booking
// @route   POST /api/payments/inventory
// @access  Private (User must own the booking)
export const processInventoryPayment = async (req, res) => {
  try {
    console.log("=== Inventory Payment Processing Request ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      bookingId,
      paymentMethod,
      paymentDetails,
      currency = 'LKR'
    } = req.body;

    // Validate required fields
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and payment method are required"
      });
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'bank_transfer', 'cash'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Valid methods: ${validPaymentMethods.join(', ')}`
      });
    }

    // Find the inventory booking
    const inventoryBooking = await InventoryBooking.findById(bookingId)
      .populate('items.inventory', 'name brand model')
      .populate('user', 'firstName lastName email');

    if (!inventoryBooking) {
      return res.status(404).json({
        success: false,
        message: "Inventory booking not found"
      });
    }

    // Check if user owns the booking
    if (inventoryBooking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only pay for your own bookings."
      });
    }

    // Check if booking is eligible for payment
    if (inventoryBooking.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this booking"
      });
    }

    if (inventoryBooking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Cannot process payment for cancelled booking"
      });
    }

    // Get payment amount
    const amount = inventoryBooking.pricing?.total || 0;
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    // Prepare payment data
    const paymentData = {
      amount,
      currency,
      bookingId: inventoryBooking._id,
      customerName: `${inventoryBooking.user.firstName} ${inventoryBooking.user.lastName}`,
      customerEmail: inventoryBooking.user.email,
      description: `Payment for equipment rental - ${inventoryBooking.items.map(item => item.inventory.name).join(', ')}`,
      ...paymentDetails
    };

    console.log("Processing payment with data:", paymentData);

    // Process payment based on method
    let paymentResult;
    switch (paymentMethod) {
      case 'card':
        paymentResult = await mockPaymentGateway.processCardPayment(paymentData);
        break;
      case 'bank_transfer':
        paymentResult = await mockPaymentGateway.processBankTransfer(paymentData);
        break;
      case 'cash':
        paymentResult = await mockPaymentGateway.processCashPayment(paymentData);
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    console.log("Payment gateway response:", paymentResult);

    if (paymentResult.success) {
      // Update inventory booking with payment information - convert status to match model
      const modelPaymentStatus = paymentResult.status === 'completed' ? 'Paid' : 'Pending';
      inventoryBooking.paymentStatus = modelPaymentStatus;
      inventoryBooking.paymentMethod = paymentMethod;
      inventoryBooking.transactionId = paymentResult.transactionId;
      inventoryBooking.paymentDetails = {
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.paymentId,
        gateway: paymentResult.gateway,
        timestamp: paymentResult.timestamp,
        amount: paymentResult.amount,
        currency: paymentResult.currency
      };

      // If payment is completed, update booking status
      if (paymentResult.status === 'completed') {
        inventoryBooking.status = 'confirmed';
      }

      await inventoryBooking.save();

      // Send payment confirmation email (optional)
      try {
        const emailData = {
          customerName: `${inventoryBooking.user.firstName} ${inventoryBooking.user.lastName}`,
          customerEmail: inventoryBooking.user.email,
          bookingId: inventoryBooking.bookingId,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          paymentMethod: paymentMethod,
          transactionId: paymentResult.transactionId,
          equipmentList: inventoryBooking.items.map(item => ({
            name: item.inventory.name,
            brand: item.inventory.brand,
            model: item.inventory.model,
            quantity: item.quantity
          })),
          rentalPeriod: {
            startDate: inventoryBooking.bookingDates.startDate,
            endDate: inventoryBooking.bookingDates.endDate,
            duration: inventoryBooking.bookingDates.duration
          }
        };

        await sendPaymentConfirmationEmail(emailData, 'inventory');
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError);
        // Don't fail the payment if email fails
      }

      res.json({
        success: true,
        message: "Payment processed successfully",
        payment: {
          transactionId: paymentResult.transactionId,
          paymentId: paymentResult.paymentId,
          status: paymentResult.status,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          method: paymentMethod,
          timestamp: paymentResult.timestamp
        },
        booking: {
          id: inventoryBooking._id,
          bookingId: inventoryBooking.bookingId,
          status: inventoryBooking.status,
          paymentStatus: inventoryBooking.paymentStatus
        }
      });

    } else {
      // Payment failed
      res.status(400).json({
        success: false,
        message: "Payment processing failed",
        error: paymentResult.error || "Payment gateway returned failure"
      });
    }

  } catch (error) {
    console.error("Error processing inventory payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing payment",
      error: error.message
    });
  }
};