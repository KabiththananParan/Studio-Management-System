import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addMaintenanceRecord,
  getInventoryAnalytics,
  exportInventory,
  bulkUpdateInventory
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(admin);

// Analytics and exports (should come before parameterized routes)
router.get('/analytics', getInventoryAnalytics);
router.get('/export', exportInventory);

// CRUD operations
router.route('/')
  .get(getAllInventory)
  .post(createInventoryItem);

// Bulk operations
router.put('/bulk-update', bulkUpdateInventory);

// Individual item operations
router.route('/:id')
  .get(getInventoryById)
  .put((req, res, next) => {
    console.log('🔥 PUT route hit for inventory ID:', req.params.id);
    console.log('🔥 Request headers:', req.headers.authorization ? 'Token present' : 'No token');
    console.log('🔥 Request body keys:', Object.keys(req.body));
    next();
  }, updateInventoryItem)
  .delete(deleteInventoryItem);

// Maintenance operations
router.post('/:id/maintenance', addMaintenanceRecord);

export default router;