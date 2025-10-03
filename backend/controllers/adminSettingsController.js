import AdminSettings from '../models/AdminSettings.js';
import nodemailer from 'nodemailer';

// Get all admin settings
const getAllSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.find({});
    
    // Convert array of category-specific settings to a single object
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.category] = setting[setting.category];
    });
    
    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin settings',
      error: error.message
    });
  }
};

// Get settings for a specific category
const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    let settings = await AdminSettings.findOne({ category });
    
    // If settings don't exist, create with defaults
    if (!settings) {
      const defaults = AdminSettings.getDefaults(category);
      settings = await AdminSettings.create({
        category,
        [category]: defaults
      });
    }
    
    res.json({
      success: true,
      data: settings[category]
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.category} settings:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.category} settings`,
      error: error.message
    });
  }
};

// Update settings for a specific category
const updateSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const updateData = req.body;
    
    const validCategories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    // Find existing settings or create new ones
    let settings = await AdminSettings.findOne({ category });
    
    if (!settings) {
      // Create new settings with the update data
      settings = new AdminSettings({
        category,
        [category]: updateData
      });
    } else {
      // Update existing settings
      settings[category] = { ...settings[category], ...updateData };
    }
    
    // Validate and save
    await settings.save();
    
    res.json({
      success: true,
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
      data: settings[category]
    });
  } catch (error) {
    console.error(`Error updating ${req.params.category} settings:`, error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to update ${req.params.category} settings`,
      error: error.message
    });
  }
};

// Reset settings for a specific category to defaults
const resetSettingsToDefaults = async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    const defaults = AdminSettings.getDefaults(category);
    
    let settings = await AdminSettings.findOne({ category });
    
    if (!settings) {
      settings = new AdminSettings({
        category,
        [category]: defaults
      });
    } else {
      settings[category] = defaults;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings reset to defaults`,
      data: settings[category]
    });
  } catch (error) {
    console.error(`Error resetting ${req.params.category} settings:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to reset ${req.params.category} settings`,
      error: error.message
    });
  }
};

// Test email connection with provided settings
const testEmailConnection = async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromName, fromEmail } = req.body;
    
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return res.status(400).json({
        success: false,
        message: 'SMTP host, user, and password are required for email testing'
      });
    }
    
    // Create transporter with provided settings
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort || 587,
      secure: (smtpPort || 587) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });
    
    // Verify connection
    await transporter.verify();
    
    // Send test email
    const testEmailOptions = {
      from: `${fromName || 'StudioPro'} <${fromEmail || smtpUser}>`,
      to: smtpUser, // Send to same email for testing
      subject: 'StudioPro Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test Successful</h2>
          <p>This is a test email to verify your SMTP configuration for StudioPro Management System.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>SMTP Host: ${smtpHost}</li>
            <li>SMTP Port: ${smtpPort || 587}</li>
            <li>From Name: ${fromName || 'StudioPro'}</li>
            <li>From Email: ${fromEmail || smtpUser}</li>
          </ul>
          <p>If you received this email, your email configuration is working correctly.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from StudioPro Management System.<br>
            Test conducted at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(testEmailOptions);
    
    res.json({
      success: true,
      message: 'Email connection test successful! Check your inbox for the test email.'
    });
  } catch (error) {
    console.error('Email connection test failed:', error);
    
    let errorMessage = 'Email connection test failed';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your username and password.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'SMTP host not found. Please check the host address.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. Please check the host and port.';
    } else if (error.responseCode && error.response) {
      errorMessage = `SMTP Error: ${error.response}`;
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// Initialize default settings (utility function)
const initializeDefaultSettings = async (req, res) => {
  try {
    await AdminSettings.initializeDefaults();
    
    res.json({
      success: true,
      message: 'Default settings initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing default settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default settings',
      error: error.message
    });
  }
};

// Get system health status
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message
    });
  }
};

// Backup settings (export)
const backupSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.find({});
    
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: {}
    };
    
    settings.forEach(setting => {
      backup.settings[setting.category] = setting[setting.category];
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="studiopro-settings-backup-${Date.now()}.json"`);
    res.json(backup);
  } catch (error) {
    console.error('Error backing up settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to backup settings',
      error: error.message
    });
  }
};

// Restore settings (import)
const restoreSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup data. Settings object is required.'
      });
    }
    
    const validCategories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
    const restoredCategories = [];
    
    for (const [category, categoryData] of Object.entries(settings)) {
      if (validCategories.includes(category)) {
        let categorySettings = await AdminSettings.findOne({ category });
        
        if (!categorySettings) {
          categorySettings = new AdminSettings({
            category,
            [category]: categoryData
          });
        } else {
          categorySettings[category] = categoryData;
        }
        
        await categorySettings.save();
        restoredCategories.push(category);
      }
    }
    
    res.json({
      success: true,
      message: `Settings restored successfully for categories: ${restoredCategories.join(', ')}`,
      restoredCategories
    });
  } catch (error) {
    console.error('Error restoring settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore settings',
      error: error.message
    });
  }
};

export {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
  resetSettingsToDefaults,
  testEmailConnection,
  initializeDefaultSettings,
  getSystemHealth,
  backupSettings,
  restoreSettings
};