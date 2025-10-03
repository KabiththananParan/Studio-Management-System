import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
  resetSettingsToDefaults,
  testEmailConnection,
  initializeDefaultSettings,
  getSystemHealth,
  backupSettings,
  restoreSettings
} from '../controllers/adminSettingsController.js';

const router = express.Router();

// Apply auth middleware to all routes (protect ensures authentication, admin ensures admin role)
router.use(protect);
router.use(admin);

// GET /api/admin/settings - Get all settings
router.get('/', getAllSettings);

// GET /api/admin/settings/:category - Get settings for specific category
router.get('/:category', getSettingsByCategory);

// PUT /api/admin/settings/:category - Update settings for specific category
router.put('/:category', updateSettingsByCategory);

// POST /api/admin/settings/reset/:category - Reset category to defaults
router.post('/reset/:category', resetSettingsToDefaults);

// POST /api/admin/settings/test-email - Test email configuration
router.post('/test-email', testEmailConnection);

// POST /api/admin/settings/initialize - Initialize default settings (utility)
router.post('/initialize', initializeDefaultSettings);

// GET /api/admin/settings/system/health - Get system health status
router.get('/system/health', getSystemHealth);

// GET /api/admin/settings/backup/export - Backup/export all settings
router.get('/backup/export', backupSettings);

// POST /api/admin/settings/backup/restore - Restore/import settings
router.post('/backup/restore', restoreSettings);

export default router;