import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Notification from './models/Notification.js';

dotenv.config();

const checkNotifications = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking notification records in database...');
    
    // Get all notification records
    const allNotifications = await Notification.find({}).lean();
    console.log(`📊 Total notification records in DB: ${allNotifications.length}`);
    
    if (allNotifications.length > 0) {
      console.log('\n📋 Sample notification records:');
      allNotifications.slice(0, 5).forEach((notification, index) => {
        console.log(`${index + 1}. ID: ${notification.notificationId}, Admin: ${notification.adminId}, Type: ${notification.notificationType}`);
      });
    }
    
    // Check specific admin
    const adminId = allNotifications[0]?.adminId;
    if (adminId) {
      const adminNotifications = await Notification.find({ adminId }).lean();
      console.log(`\n📊 Notifications for admin ${adminId}: ${adminNotifications.length}`);
      
      const notificationIds = new Set(adminNotifications.map(n => n.notificationId));
      console.log('📋 Read notification IDs:', Array.from(notificationIds));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkNotifications();