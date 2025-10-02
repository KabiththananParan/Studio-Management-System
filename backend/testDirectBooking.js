import mongoose from 'mongoose';
import Inventory from './models/Inventory.js';
import InventoryBooking from './models/InventoryBooking.js';
import User from './models/User.js';
import connectDB from './config/db.js';

const testBookingCreation = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Get a test user
    const user = await User.findOne().select('_id firstName lastName email');
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    console.log('👤 Found user:', user.firstName, user.lastName);

    // Get a test inventory item
    const inventory = await Inventory.findOne({ status: 'Available' });
    if (!inventory) {
      console.log('❌ No available inventory found');
      return;
    }
    console.log('📦 Found inventory:', inventory.name);

    // Create a test booking
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 8);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    console.log('📅 Booking dates:', startDate.toISOString(), 'to', endDate.toISOString());
    console.log('📅 Duration:', days, 'days');

    // Calculate pricing
    const pricing = inventory.calculateRentalCost(days, 1);
    console.log('💰 Pricing:', pricing);

    const bookingData = {
      user: user._id,
      items: [{
        inventory: inventory._id,
        quantity: 1,
        dailyRate: pricing.daily,
        subtotal: pricing.total
      }],
      bookingDates: {
        startDate,
        endDate,
        duration: days
      },
      customerInfo: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: 'Not provided'
      },
      pricing: {
        subtotal: pricing.total,
        tax: Math.round(pricing.total * 0.1),
        discount: 0,
        total: pricing.total + Math.round(pricing.total * 0.1)
      },
      notes: {
        userNotes: 'Test booking',
        specialRequirements: ''
      },
      status: 'Pending',
      paymentStatus: 'Pending'
    };

    console.log('📋 Creating booking with data:', JSON.stringify(bookingData, null, 2));

    const booking = new InventoryBooking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully!');
    console.log('🎫 Booking ID:', booking.bookingId);

  } catch (error) {
    console.error('❌ Error creating booking:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
};

testBookingCreation();