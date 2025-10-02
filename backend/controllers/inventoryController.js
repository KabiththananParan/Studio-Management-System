import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';

// Get all inventory items with filtering and pagination
export const getAllInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      condition,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (condition && condition !== 'all') {
      filter.condition = condition;
    }
    
    if (location && location !== 'all') {
      filter.location = new RegExp(location, 'i');
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
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name'),
      Inventory.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: items.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items'
    });
  }
};

// Get single inventory item by ID
export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const item = await Inventory.findOne({ _id: id, isActive: true })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('usageHistory.bookingId', 'bookingId customerInfo.name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item'
    });
  }
};

// Create new inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Validate required fields
    const requiredFields = ['name', 'category', 'brand', 'model', 'serialNumber', 'quantity', 'location', 'purchaseDate', 'purchasePrice'];
    const missingFields = requiredFields.filter(field => !itemData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if serial number already exists
    const existingItem = await Inventory.findOne({ 
      serialNumber: itemData.serialNumber,
      isActive: true 
    });
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists'
      });
    }

    // Set default values
    if (!itemData.availableQuantity) {
      itemData.availableQuantity = itemData.quantity;
    }
    
    if (!itemData.currentValue) {
      itemData.currentValue = itemData.purchasePrice;
    }

    const newItem = new Inventory(itemData);
    await newItem.save();

    // Populate the created item
    const populatedItem = await Inventory.findById(newItem._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: populatedItem
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Serial number or QR code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item'
    });
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.usageHistory;

    // Check if serial number is being updated and if it already exists
    if (updateData.serialNumber) {
      const existingItem = await Inventory.findOne({
        serialNumber: updateData.serialNumber,
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Serial number already exists'
        });
      }
    }

    const updatedItem = await Inventory.findOneAndUpdate(
      { _id: id, isActive: true },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name');

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item'
    });
  }
};

// Delete inventory item (soft delete)
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const deletedItem = await Inventory.findOneAndUpdate(
      { _id: id, isActive: true },
      { 
        isActive: false,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item'
    });
  }
};

// Add maintenance record
export const addMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, cost, performedBy, nextMaintenanceDate } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const maintenanceRecord = {
      type,
      description,
      cost: cost || 0,
      performedBy,
      nextMaintenanceDate
    };

    const item = await Inventory.findOneAndUpdate(
      { _id: id, isActive: true },
      { 
        $push: { maintenanceHistory: maintenanceRecord },
        updatedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy updatedBy', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: item
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding maintenance record'
    });
  }
};

// Get inventory analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    const [
      overallStats,
      categoryStats,
      statusStats,
      conditionStats,
      recentItems,
      maintenanceAlerts,
      lowStockItems
    ] = await Promise.all([
      // Overall statistics
      Inventory.getInventoryStats(),
      
      // Category breakdown
      Inventory.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: '$currentValue' },
            availableItems: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Status breakdown
      Inventory.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Condition breakdown
      Inventory.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$condition',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recently added items
      Inventory.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name brand model createdAt')
        .populate('createdBy', 'name'),
        
      // Items needing maintenance
      Inventory.find({
        isActive: true,
        $or: [
          { 'maintenanceHistory.nextMaintenanceDate': { $lte: new Date() } },
          { condition: 'Needs Repair' }
        ]
      })
        .select('name brand model condition maintenanceHistory')
        .limit(10),
        
      // Low stock items (quantity <= 2)
      Inventory.find({
        isActive: true,
        availableQuantity: { $lte: 2, $gt: 0 }
      })
        .select('name brand model availableQuantity quantity')
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        overview: overallStats,
        categoryBreakdown: categoryStats,
        statusBreakdown: statusStats,
        conditionBreakdown: conditionStats,
        recentItems,
        maintenanceAlerts,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory analytics'
    });
  }
};

// Export inventory data
export const exportInventory = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const items = await Inventory.find({ isActive: true })
      .populate('createdBy updatedBy', 'name')
      .lean();

    if (format === 'csv') {
      // Simple CSV export
      const csvData = items.map(item => ({
        Name: item.name,
        Category: item.category,
        Brand: item.brand,
        Model: item.model,
        'Serial Number': item.serialNumber,
        Quantity: item.quantity,
        'Available Quantity': item.availableQuantity,
        Status: item.status,
        Condition: item.condition,
        Location: item.location,
        'Purchase Date': item.purchaseDate,
        'Purchase Price': item.purchasePrice,
        'Current Value': item.currentValue,
        'Created At': item.createdAt
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
      
      // Simple CSV conversion (you might want to use a proper CSV library)
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: items,
        exportedAt: new Date(),
        totalItems: items.length
      });
    }
  } catch (error) {
    console.error('Error exporting inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting inventory data'
    });
  }
};

// Bulk update inventory items
export const bulkUpdateInventory = async (req, res) => {
  try {
    const { ids, updateData } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of inventory IDs'
      });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid inventory IDs provided'
      });
    }

    const bulkUpdateData = {
      ...updateData,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    const result = await Inventory.updateMany(
      { _id: { $in: validIds }, isActive: true },
      bulkUpdateData
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} inventory items`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory items'
    });
  }
};