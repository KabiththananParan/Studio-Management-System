import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";

dotenv.config();

const listAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const admins = await Admin.find({});
    console.log(`\n👨‍💼 Found ${admins.length} admin users:`);
    
    if (admins.length === 0) {
      console.log('\n⚠️ No admin users found! Run createAdmin.js to create one.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.fullName || admin.firstName + ' ' + admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Username: ${admin.username || 'N/A'}`);
        console.log(`   Role: ${admin.role || 'admin'}`);
        console.log(`   Active: ${admin.isActive !== false ? 'Yes' : 'No'}`);
        console.log(`   ID: ${admin._id}`);
      });
      
      console.log('\n📝 You can use any of these admin accounts to test inventory editing:');
      console.log('1. Login with admin credentials');
      console.log('2. Go to Admin Dashboard > Inventory Management');
      console.log('3. Try editing any item');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

listAdmins();