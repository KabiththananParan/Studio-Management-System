import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import AdminSettings from './models/AdminSettings.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const initializeAdminSettings = async () => {
  try {
    console.log('🚀 Initializing Admin Settings...');
    
    await connectDB();
    
    // Initialize default settings for all categories
    await AdminSettings.initializeDefaults();
    
    console.log('✅ Admin settings initialized successfully!');
    
    // Display created settings
    const allSettings = await AdminSettings.find({});
    console.log('\n📊 Created Settings Categories:');
    allSettings.forEach(setting => {
      console.log(`   - ${setting.category.charAt(0).toUpperCase() + setting.category.slice(1)} Settings`);
    });
    
    console.log('\n🎉 Setup completed! You can now configure your admin settings through the dashboard.');
    
  } catch (error) {
    console.error('❌ Error initializing admin settings:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the initialization
initializeAdminSettings();