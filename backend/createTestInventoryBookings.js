import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Inventory from './models/Inventory.js';
import InventoryBooking from './models/InventoryBooking.js';

// Load environment variables
dotenv.config();

const createTestInventoryBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Find a test user (you can replace with your actual user email)
    let testUser = await User.findOne({ email: { $regex: /test|demo|admin/i } });
    
    if (!testUser) {
      // Create a test user if none exists
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        userName: 'testuser',
        password: 'password123',
        role: 'user'
      });
      await testUser.save();
      console.log('👤 Created test user');
    }

    // Find available inventory items
    const inventoryItems = await Inventory.find({
      status: 'Available',
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    }).limit(5);

    console.log(`📸 Found ${inventoryItems.length} available inventory items`);

    if (inventoryItems.length === 0) {
      console.log('❌ No inventory items found. Please add inventory first.');
      return;
    }

    // Create test bookings
    const testBookings = [];

    // Booking 1 - Pending Payment
    const booking1 = new InventoryBooking({
      user: testUser._id,
      bookingId: `RNT${Date.now()}1`,
      items: [{
        inventory: inventoryItems[0]._id,
        quantity: 1,
        dailyRate: inventoryItems[0].rental.dailyRate,
        duration: 3,
        subtotal: inventoryItems[0].rental.dailyRate * 3
      }],
      bookingDates: {
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
        duration: 3
      },
      customerInfo: {
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        phone: '+94712345678'
      },
      pricing: {
        subtotal: inventoryItems[0].rental.dailyRate * 3,
        total: inventoryItems[0].rental.dailyRate * 3
      },
      notes: {
        userNotes: 'Test rental booking - pending payment',
        specialRequirements: ''
      },
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    // Booking 2 - Paid/Confirmed
    const booking2 = new InventoryBooking({
      user: testUser._id,
      bookingId: `RNT${Date.now()}2`,
      items: [{
        inventory: inventoryItems[1]._id,
        quantity: 1,
        dailyRate: inventoryItems[1].rental.dailyRate,
        duration: 5,
        subtotal: inventoryItems[1].rental.dailyRate * 5
      }],
      bookingDates: {
        startDate: new Date(Date.now() + 86400000 * 2), // Day after tomorrow
        endDate: new Date(Date.now() + 86400000 * 7), // Week from now
        duration: 5
      },
      customerInfo: {
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        phone: '+94712345678'
      },
      pricing: {
        subtotal: inventoryItems[1].rental.dailyRate * 5,
        total: inventoryItems[1].rental.dailyRate * 5
      },
      notes: {
        userNotes: 'Test rental booking - paid and confirmed',
        specialRequirements: 'Handle with care'
      },
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      transactionId: 'TXN' + Date.now()
    });

    // Booking 3 - Completed
    const booking3 = new InventoryBooking({
      user: testUser._id,
      bookingId: `RNT${Date.now()}3`,
      items: [{
        inventory: inventoryItems[2]._id,
        quantity: 1,
        dailyRate: inventoryItems[2].rental.dailyRate,
        duration: 2,
        subtotal: inventoryItems[2].rental.dailyRate * 2
      }],
      bookingDates: {
        startDate: new Date(Date.now() - 86400000 * 7), // Week ago
        endDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
        duration: 2
      },
      customerInfo: {
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        phone: '+94712345678'
      },
      pricing: {
        subtotal: inventoryItems[2].rental.dailyRate * 2,
        total: inventoryItems[2].rental.dailyRate * 2
      },
      notes: {
        userNotes: 'Completed rental booking',
        specialRequirements: ''
      },
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN' + (Date.now() - 100000)
    });

    testBookings.push(booking1, booking2, booking3);

    // Save all bookings
    for (let i = 0; i < testBookings.length; i++) {
      await testBookings[i].save();
      console.log(`✅ Created booking ${i + 1}: ${testBookings[i].status} - ${testBookings[i].paymentStatus}`);
    }

    console.log('\n🎉 Test inventory bookings created successfully!');
    console.log(`👤 User: ${testUser.email}`);
    console.log('📊 Bookings created:');
    console.log('  - 1 Pending Payment');
    console.log('  - 1 Confirmed/Paid');
    console.log('  - 1 Completed');
    
  } catch (error) {
    console.error('❌ Error creating test bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

// Run the script
createTestInventoryBookings();