import Inventory from './models/Inventory.js';
import './config/db.js';

const checkInventoryData = async () => {
  try {
    const item = await Inventory.findOne();
    console.log('Sample inventory item structure:');
    console.log(JSON.stringify(item, null, 2));
    
    const availableItems = await Inventory.find({
      status: 'Available',
      'rental.isAvailableForRent': true,
      availableQuantity: { $gt: 0 }
    });
    
    console.log('\n=== Available Items Summary ===');
    availableItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Daily Rate: ${item.rental?.dailyRate}`);
      console.log(`   Available for Rent: ${item.rental?.isAvailableForRent}`);
      console.log(`   Available Quantity: ${item.availableQuantity}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkInventoryData();