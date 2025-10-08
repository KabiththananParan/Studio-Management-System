import dotenv from "dotenv";
import mongoose from "mongoose";
import Inventory from "./models/Inventory.js";

dotenv.config();

const testInventoryItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const inventory = await Inventory.find({}).limit(5);
    console.log(`\n📦 Found ${inventory.length} inventory items:`);
    
    inventory.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name || 'MISSING NAME'}`);
      console.log(`   ID: ${item._id}`);
      console.log(`   Brand/Model: ${item.brand} ${item.model}`);
      console.log(`   Daily Rate: Rs.${item.rental?.dailyRate || 'N/A'}`);
      console.log(`   Purchase Price: Rs.${item.purchasePrice || 'N/A'}`);
      console.log(`   Available: ${item.availableQuantity}/${item.quantity}`);
      console.log(`   Status: ${item.status || 'N/A'}`);
      console.log(`   Category: ${item.category || 'N/A'}`);
    });

    if (inventory.length === 0) {
      console.log('\n⚠️  No inventory items found! Run createTestInventory.js first.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

testInventoryItems();