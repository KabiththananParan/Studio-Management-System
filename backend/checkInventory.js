// Quick inventory check script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';

dotenv.config();

async function checkInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Count total inventory
    const totalCount = await Inventory.countDocuments();
    console.log(`Total inventory items: ${totalCount}`);
    
    // Count available for rent
    const availableCount = await Inventory.countDocuments({
      status: 'Available',
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    });
    console.log(`Available for rent: ${availableCount}`);
    
    // Get sample items
    const sampleItems = await Inventory.find({
      status: 'Available',
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    }).limit(3).select('name brand model rental.dailyRate');
    
    console.log('\nSample available items:');
    sampleItems.forEach(item => {
      console.log(`- ${item.name} (${item.brand} ${item.model}) - LKR ${item.rental?.dailyRate}/day`);
    });
    
    // Check for any items with missing rental info
    const noRentalInfo = await Inventory.countDocuments({
      status: 'Available',
      $or: [
        { 'rental.isAvailableForRent': { $ne: true } },
        { 'rental.dailyRate': { $exists: false } },
        { 'rental.dailyRate': null }
      ]
    });
    console.log(`\nItems without proper rental info: ${noRentalInfo}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkInventory();