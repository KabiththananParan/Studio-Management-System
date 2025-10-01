import Slot from "../models/Slot.js";
import Package from "../models/Package.js";

// @desc    Get all slots for a specific package
// @route   GET /api/admin/slots/:packageId
// @access  Private/Admin
export const getSlotsByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
      return res.status(404).json({ message: "Package not found" });
    }

    const slots = await Slot.find({ packageId })
      .populate('packageId', 'name price')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      slots,
      count: slots.length
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all slots (for admin overview)
// @route   GET /api/admin/slots
// @access  Private/Admin
export const getAllSlots = async (req, res) => {
  try {
    const { page = 1, limit = 50, packageId, date, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (packageId) filter.packageId = packageId;
    if (date) {
      const targetDate = new Date(date);
      filter.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    }
    if (status) filter.status = status;

    const slots = await Slot.find(filter)
      .populate('packageId', 'name price')
      .populate('bookingId', 'bookingReference customerInfo.name')
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Slot.countDocuments(filter);

    res.json({
      success: true,
      slots,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching all slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new slot
// @route   POST /api/admin/slots
// @access  Private/Admin
export const createSlot = async (req, res) => {
  try {
    const { packageId, date, startTime, endTime, price, isAvailable, notes } = req.body;

    // Validate required fields
    if (!packageId || !date || !startTime || !endTime || price === undefined) {
      return res.status(400).json({ 
        message: "Package ID, date, start time, end time, and price are required" 
      });
    }

    // Verify package exists
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Check for conflicting slots
    const conflictingSlots = await Slot.find({
      packageId,
      date: new Date(date),
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({ 
        message: "Time slot conflicts with existing slot" 
      });
    }

    // Create new slot
    const slot = new Slot({
      packageId,
      date: new Date(date),
      startTime,
      endTime,
      price: Number(price),
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      notes: notes || "",
      status: isAvailable !== false ? 'available' : 'blocked'
    });

    await slot.save();
    
    // Populate package info for response
    await slot.populate('packageId', 'name price');

    res.status(201).json({
      success: true,
      message: "Slot created successfully",
      slot
    });
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a slot
// @route   PUT /api/admin/slots/:id
// @access  Private/Admin
export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, price, isAvailable, notes, status } = req.body;

    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if slot is booked and prevent certain updates
    if (slot.status === 'booked' && slot.bookingId) {
      return res.status(400).json({ 
        message: "Cannot modify booked slot. Cancel booking first." 
      });
    }

    // If updating time/date, check for conflicts
    if (date || startTime || endTime) {
      const newDate = date ? new Date(date) : slot.date;
      const newStartTime = startTime || slot.startTime;
      const newEndTime = endTime || slot.endTime;

      const conflictingSlots = await Slot.find({
        _id: { $ne: id }, // Exclude current slot
        packageId: slot.packageId,
        date: newDate,
        $or: [
          {
            $and: [
              { startTime: { $lt: newEndTime } },
              { endTime: { $gt: newStartTime } }
            ]
          }
        ]
      });

      if (conflictingSlots.length > 0) {
        return res.status(400).json({ 
          message: "Updated time slot conflicts with existing slot" 
        });
      }
    }

    // Update slot fields
    if (date) slot.date = new Date(date);
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (price !== undefined) slot.price = Number(price);
    if (isAvailable !== undefined) {
      slot.isAvailable = isAvailable;
      slot.status = isAvailable ? 'available' : 'blocked';
    }
    if (notes !== undefined) slot.notes = notes;
    if (status) slot.status = status;

    await slot.save();
    await slot.populate('packageId', 'name price');

    res.json({
      success: true,
      message: "Slot updated successfully",
      slot
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a slot
// @route   DELETE /api/admin/slots/:id
// @access  Private/Admin
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if slot is booked
    if (slot.status === 'booked' && slot.bookingId) {
      return res.status(400).json({ 
        message: "Cannot delete booked slot. Cancel booking first." 
      });
    }

    await Slot.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Slot deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get slot statistics for dashboard
// @route   GET /api/admin/slots/stats
// @access  Private/Admin
export const getSlotStats = async (req, res) => {
  try {
    const stats = await Slot.getSlotStats();
    
    // Additional stats
    const today = new Date();
    const todaySlots = await Slot.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    const upcomingSlots = await Slot.countDocuments({
      date: { $gt: new Date() },
      status: 'available'
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        todaySlots,
        upcomingSlots
      }
    });
  } catch (error) {
    console.error("Error fetching slot stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Bulk create slots for a package
// @route   POST /api/admin/slots/bulk
// @access  Private/Admin
export const bulkCreateSlots = async (req, res) => {
  try {
    const { 
      packageId, 
      startDate, 
      endDate, 
      timeSlots, // Array of {startTime, endTime, price}
      excludeDays = [], // Array of day names to exclude (e.g., ['Sunday'])
      notes = ""
    } = req.body;

    // Validate required fields
    if (!packageId || !startDate || !endDate || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ 
        message: "Package ID, start date, end date, and time slots array are required" 
      });
    }

    // Verify package exists
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
      return res.status(404).json({ message: "Package not found" });
    }

    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate slots for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Skip excluded days
      if (excludeDays.includes(dayName)) continue;
      
      // Create slots for each time slot on this date
      for (const timeSlot of timeSlots) {
        // Check for existing conflicts
        const conflicting = await Slot.findOne({
          packageId,
          date: new Date(date),
          $or: [
            {
              $and: [
                { startTime: { $lt: timeSlot.endTime } },
                { endTime: { $gt: timeSlot.startTime } }
              ]
            }
          ]
        });

        if (!conflicting) {
          slots.push({
            packageId,
            date: new Date(date),
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            price: timeSlot.price,
            isAvailable: true,
            notes,
            status: 'available'
          });
        }
      }
    }

    if (slots.length === 0) {
      return res.status(400).json({ 
        message: "No slots to create. All time slots may already exist or conflict with existing ones." 
      });
    }

    // Bulk insert slots
    const createdSlots = await Slot.insertMany(slots);

    res.status(201).json({
      success: true,
      message: `${createdSlots.length} slots created successfully`,
      count: createdSlots.length,
      slots: createdSlots
    });
  } catch (error) {
    console.error("Error bulk creating slots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};