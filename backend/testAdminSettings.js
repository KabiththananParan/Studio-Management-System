import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import mongoose from 'mongoose';
import AdminSettings from './models/AdminSettings.js';

const BASE_URL = 'http://localhost:5000';

// Test admin credentials (you'll need to create an admin account first)
const ADMIN_CREDENTIALS = {
  email: 'admin@studiopro.com',
  password: 'admin123'
};

let authToken = '';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const loginAdmin = async () => {
  try {
    console.log('🔑 Logging in as admin...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/admin/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.error('❌ Admin login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Admin login error:', error.response?.data?.message || error.message);
    return false;
  }
};

const testGetAllSettings = async () => {
  try {
    console.log('\n📋 Testing: Get All Settings');
    
    const response = await axios.get(`${BASE_URL}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Successfully retrieved all settings');
      console.log('📊 Available categories:', Object.keys(response.data.data));
    } else {
      console.error('❌ Failed to get settings:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Get all settings error:', error.response?.data?.message || error.message);
  }
};

const testGetCategorySettings = async () => {
  try {
    console.log('\n📋 Testing: Get Category Settings (General)');
    
    const response = await axios.get(`${BASE_URL}/api/admin/settings/general`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Successfully retrieved general settings');
      console.log('🏢 Site Name:', response.data.data.siteName);
      console.log('💰 Currency:', response.data.data.currency);
      console.log('📧 Contact Email:', response.data.data.contactEmail);
    } else {
      console.error('❌ Failed to get category settings:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Get category settings error:', error.response?.data?.message || error.message);
  }
};

const testUpdateSettings = async () => {
  try {
    console.log('\n📝 Testing: Update Settings');
    
    const updatedSettings = {
      siteName: 'StudioPro Management System - Updated',
      contactPhone: '+1 (555) 987-6543',
      taxRate: 12.5
    };
    
    const response = await axios.put(`${BASE_URL}/api/admin/settings/general`, updatedSettings, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Successfully updated general settings');
      console.log('📄 Updated site name:', response.data.data.siteName);
      console.log('📞 Updated phone:', response.data.data.contactPhone);
      console.log('💸 Updated tax rate:', response.data.data.taxRate + '%');
    } else {
      console.error('❌ Failed to update settings:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Update settings error:', error.response?.data?.message || error.message);
  }
};

const testEmailSettings = async () => {
  try {
    console.log('\n📧 Testing: Email Settings');
    
    // Test getting email settings
    const getResponse = await axios.get(`${BASE_URL}/api/admin/settings/email`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (getResponse.data.success) {
      console.log('✅ Successfully retrieved email settings');
      
      // Test updating email settings
      const emailUpdate = {
        fromName: 'StudioPro Team',
        enableBookingConfirmations: true,
        enableReminderEmails: true,
        reminderHoursBefore: 48
      };
      
      const updateResponse = await axios.put(`${BASE_URL}/api/admin/settings/email`, emailUpdate, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (updateResponse.data.success) {
        console.log('✅ Successfully updated email settings');
        console.log('👤 From Name:', updateResponse.data.data.fromName);
        console.log('⏰ Reminder Hours:', updateResponse.data.data.reminderHoursBefore);
      }
    }
  } catch (error) {
    console.error('❌ Email settings error:', error.response?.data?.message || error.message);
  }
};

const testResetToDefaults = async () => {
  try {
    console.log('\n🔄 Testing: Reset to Defaults');
    
    const response = await axios.post(`${BASE_URL}/api/admin/settings/reset/general`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Successfully reset general settings to defaults');
      console.log('📄 Default site name:', response.data.data.siteName);
      console.log('💰 Default currency:', response.data.data.currency);
    } else {
      console.error('❌ Failed to reset settings:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Reset settings error:', error.response?.data?.message || error.message);
  }
};

const testInitializeDefaults = async () => {
  try {
    console.log('\n🚀 Testing: Initialize Default Settings');
    
    const response = await axios.post(`${BASE_URL}/api/admin/settings/initialize`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Successfully initialized default settings');
    } else {
      console.error('❌ Failed to initialize defaults:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Initialize defaults error:', error.response?.data?.message || error.message);
  }
};

const testValidationErrors = async () => {
  try {
    console.log('\n⚠️  Testing: Validation Errors');
    
    // Test with invalid data
    const invalidSettings = {
      taxRate: 150, // Should fail - max is 100
      currency: 'INVALID' // Should fail - not in enum
    };
    
    const response = await axios.put(`${BASE_URL}/api/admin/settings/general`, invalidSettings, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ Validation test should have failed, but got:', response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation correctly rejected invalid data');
      console.log('📝 Error message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected validation error:', error.response?.data?.message || error.message);
    }
  }
};

const testUnauthorizedAccess = async () => {
  try {
    console.log('\n🚫 Testing: Unauthorized Access');
    
    const response = await axios.get(`${BASE_URL}/api/admin/settings`);
    console.log('❌ Should have been unauthorized, but got:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly blocked unauthorized access');
    } else {
      console.error('❌ Unexpected authorization error:', error.response?.data?.message || error.message);
    }
  }
};

const runAllTests = async () => {
  console.log('🧪 Starting Admin Settings API Tests\n');
  console.log('=' .repeat(50));
  
  try {
    // Connect to database
    await connectDB();
    
    // Test unauthorized access first
    await testUnauthorizedAccess();
    
    // Login as admin
    const loginSuccess = await loginAdmin();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without admin authentication');
      return;
    }
    
    // Initialize defaults (in case they don't exist)
    await testInitializeDefaults();
    
    // Run all tests
    await testGetAllSettings();
    await testGetCategorySettings();
    await testUpdateSettings();
    await testEmailSettings();
    await testValidationErrors();
    await testResetToDefaults();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Additional utility functions for database verification
const verifyDatabaseSettings = async () => {
  try {
    console.log('\n🔍 Verifying Database Settings...');
    
    const categories = ['general', 'email', 'security', 'booking', 'payment', 'system', 'preferences'];
    
    for (const category of categories) {
      const settings = await AdminSettings.findOne({ category });
      if (settings) {
        console.log(`✅ ${category.charAt(0).toUpperCase() + category.slice(1)} settings found`);
      } else {
        console.log(`❌ ${category.charAt(0).toUpperCase() + category.slice(1)} settings missing`);
      }
    }
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  }
};

// Run verification if called directly
if (process.argv[2] === '--verify-db') {
  connectDB().then(verifyDatabaseSettings).then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
} else {
  // Run full test suite
  runAllTests();
}