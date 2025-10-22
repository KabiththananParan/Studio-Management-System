import Slot from "../models/Slot.js";
import Package from "../models/Package.js";
import SlotRequest from "../models/SlotRequest.js";
import User from "../models/User.js";

// @desc    Get available slots for a specific package (public/user access)
// @route   GET /api/user/slots/:packageId
// @access  Public
export const getAvailableSlotsByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verify package exists and is active
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc || !packageDoc.isActive) {
      return res.status(404).json({ message: "Package not found or inactive" });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    } else {
      // Default to next 30 days if no date range specified
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      dateFilter.date = {
        $gte: today,
        $lte: futureDate
      };
    }

    // Fetch available slots
    const slots = await Slot.find({
      packageId,
      ...dateFilter,
      isAvailable: true,
      status: 'available'
    })
    .populate('packageId', 'name price')
    .sort({ date: 1, startTime: 1 });

    // Filter out past slots (if date is today, check time too)
    const now = new Date();
    const filteredSlots = slots.filter(slot => {
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // If slot is today, check if time hasn't passed
      if (slotDate.toDateString() === now.toDateString()) {
        const slotDateTime = new Date(`${slot.date.toDateString()} ${slot.startTime}`);
        return slotDateTime > now;
      }
      
      // If slot is in the future, include it
      return slotDate >= today;
    });

    res.json({
      success: true,
      slots: filteredSlots,
      count: filteredSlots.length,
      package: {
        id: packageDoc._id,
        name: packageDoc.name,
        price: packageDoc.price
      }
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all available slots across packages (for calendar view)
// @route   GET /api/user/slots
// @access  Public
export const getAllAvailableSlots = async (req, res) => {
  try {
    const { startDate, endDate, packageIds } = req.query;
    
    // Build filter
    const filter = {
      isAvailable: true,
      status: 'available'
    };

    // Date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    } else {
      // Default to next 14 days
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 14);
      filter.date = {
        $gte: today,
        $lte: futureDate
      };
    }

    // Package filter
    if (packageIds) {
      const packageIdArray = packageIds.split(',');
      filter.packageId = { $in: packageIdArray };
    }

    // Only include active packages
    const slots = await Slot.find(filter)
      .populate({
        path: 'packageId',
        select: 'name price isActive',
        match: { isActive: true }
      })
      .sort({ date: 1, startTime: 1 });

    // Filter out slots where package population failed (inactive packages)
    const validSlots = slots.filter(slot => slot.packageId);

    // Filter out past slots
    const now = new Date();
    const filteredSlots = validSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (slotDate.toDateString() === now.toDateString()) {
        const slotDateTime = new Date(`${slot.date.toDateString()} ${slot.startTime}`);
        return slotDateTime > now;
      }
      
      return slotDate >= today;
    });

    // Group by date for easier frontend consumption
    const slotsByDate = filteredSlots.reduce((acc, slot) => {
      const date = slot.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    res.json({
      success: true,
      slots: filteredSlots,
      slotsByDate,
      count: filteredSlots.length
    });
  } catch (error) {
    console.error("Error fetching all available slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Check slot availability (before booking)
// @route   GET /api/user/slots/check/:slotId
// @access  Public
export const checkSlotAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    
    const slot = await Slot.findById(slotId)
      .populate('packageId', 'name price isActive');
    
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (!slot.packageId || !slot.packageId.isActive) {
      return res.status(404).json({ message: "Package not found or inactive" });
    }

    // Check if slot is still available
    const isAvailable = slot.isAvailable && 
                       slot.status === 'available' && 
                       !slot.bookingId;

    // Check if slot is not in the past
    const now = new Date();
    const slotDateTime = new Date(`${slot.date.toDateString()} ${slot.startTime}`);
    const isNotPast = slotDateTime > now;

    const actuallyAvailable = isAvailable && isNotPast;

    res.json({
      success: true,
      available: actuallyAvailable,
      slot: {
        id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        status: slot.status,
        package: slot.packageId
      },
      reasons: {
        slotBooked: !isAvailable,
        timePassedForToday: !isNotPast,
        packageInactive: !slot.packageId.isActive
      }
    });
  } catch (error) {
    console.error("Error checking slot availability:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get slot statistics for a date range (for analytics)
// @route   GET /api/user/slots/stats
// @access  Public
export const getSlotStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    } else {
      // Default to next 30 days
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      dateFilter.date = {
        $gte: today,
        $lte: futureDate
      };
    }

    const stats = await Slot.aggregate([
      {
        $match: {
          ...dateFilter,
          packageId: { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'packageId',
          foreignField: '_id',
          as: 'package'
        }
      },
      {
        $match: {
          'package.isActive': true
        }
      },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: 1 },
          availableSlots: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isAvailable', true] },
                    { $eq: ['$status', 'available'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          bookedSlots: {
            $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSlots: 0,
      availableSlots: 0,
      bookedSlots: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error fetching slot stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submit a request when no slots are available for a package
// @route   POST /api/user/slots/:packageId/request
// @access  Protected (user)
export const submitSlotRequest = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { preferredDate, note, contact } = req.body || {};

    // Verify package exists and is active
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc || !packageDoc.isActive) {
      return res.status(404).json({ message: "Package not found or inactive" });
    }

    // Build contact info: use provided contact or derive from user profile
    let contactInfo = contact || {};
    if ((!contactInfo.name || !contactInfo.email) && req.user?.id) {
      const user = await User.findById(req.user.id).lean();
      if (user) {
        contactInfo = {
          name: contactInfo.name || `${user.firstName} ${user.lastName}`.trim(),
          email: contactInfo.email || user.email,
          phone: contactInfo.phone || undefined,
        };
      }
    }

    // Create request document
    const requestDoc = await SlotRequest.create({
      userId: req.user?.id || undefined,
      packageId: packageDoc._id,
      packageName: packageDoc.name,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      note: note?.trim() || "",
      contact: contactInfo,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Your request has been recorded. Our team will contact you.",
      request: requestDoc,
    });
  } catch (error) {
    console.error("Error submitting slot request:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};